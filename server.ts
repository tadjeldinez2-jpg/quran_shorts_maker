import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up body parsers
  app.use(express.json({ limit: "50mb" }));

  // API Route - Gemini AI Quran Shorts Designer
  app.post("/api/quran/ai-generate", async (req, res) => {
    try {
      const { surahNumber, ayahNumber, text, translation, surahName } = req.body;

      if (!text || !translation) {
        return res.status(400).json({ error: "Missing verse text or translation" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        console.warn("GEMINI_API_KEY is not configured or placeholder. Returning a beautiful rule-based style.");
        const fallback = getLocalGeneratorFallback(text, translation, surahName || "Quran", surahNumber || 1, ayahNumber || 1);
        return res.json(fallback);
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `You are an expert Islamic media director, calligrapher, and vertical video creator.
Your goal is to analyze a Quranic verse (Ayah) and return the absolute best visual styling, background video Category, and typography presets for a vertical (9:16) video designed for YouTube Shorts, Reels, or TikTok.

Choose the styling based on the deep meanings, keywords, and emotional weight of the verse:
- Verses about water, relief, oceans, cleansing, streams -> ocean-aerial, abstract-sparkles, or rain-window. Use beautiful sea whites, deep aqua, or cyan.
- Verses about mountains, universe, skies, majesty, power, faith -> mountain-aerial, clouds-sunset. Style with majestic golden tints or ivory.
- Verses about prayer, mosques, angels -> mosque-illumination, mosque-night template. Use beautiful teal/sea-foam shadows and warm off-white lettering.
- Verses about trials, patience, warnings, darkness -> rain-window, abstract-sparkles. Style with dark cinematic opacity and strong text shadowing/glows.
- Verses about glad tidings, rewards, paradise, gardens -> forest-sunbeams, waves. Use beautiful emerald greens, mints or warm golds.

You must return a valid JSON object matching the following structure exactly. Do not include any markdown format tags (like \`\`\`json) or extra words around the output. Only output the raw JSON string.`;

      const promptText = `Analyze this verse and recommend styling:
Surah Name: "${surahName}"
Surah Number: ${surahNumber}
Ayah Number: ${ayahNumber}
Arabic Verse Text: "${text}"
English Translation: "${translation}"

Your JSON output must follow this format EXACTLY:
{
  "bgVideoId": "one of: clouds-sunset, rain-window, ocean-aerial, mountain-aerial, forest-sunbeams, mosque-illumination, cinematic-particles, abstract-sparkles",
  "templateId": "one of: minimal-dark, golden-islamic, cinematic-black, elegant-white, mosque-night, nature-reflection",
  "aestheticTitle": "A beautiful, deep 3-5 word conceptual theme in English (e.g. 'Sovereignty of the Stars', 'The Overflowing Mercy', 'Steadfast Patience')",
  "reflectionPrompt": "A single beautiful heart-felt sentence of reflection or context on this ayah to display as text",
  "textColor": "#HEX color matching the vibe (e.g. '#F3C65F', '#FAFAFA', '#E0F2F1')",
  "textShadowColor": "rgba formatted shadow (e.g. 'rgba(0,0,0,0.8)')",
  "textShadowBlur": 10,
  "textGlowColor": "#HEX or rgba formatted color tint (or '' if none)",
  "textGlowBlur": 4,
  "videoOpacity": 85,
  "videoBrightness": 30,
  "textPosition": 50,
  "fontName": "one of: Amiri, Scheherazade New, system-ui",
  "showTranslation": true
}`;

      let response;
      let usedModel = "gemini-3.5-flash";
      try {
        response = await ai.models.generateContent({
          model: usedModel,
          contents: promptText,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.8,
          },
        });
      } catch (err: any) {
        console.warn(`Primary model ${usedModel} failed or is currently overloaded. Attempting fallback with gemini-3.1-flash-lite...`, err.message || err);
        usedModel = "gemini-3.1-flash-lite";
        try {
          response = await ai.models.generateContent({
            model: usedModel,
            contents: promptText,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              temperature: 0.8,
            },
          });
        } catch (fallbackErr: any) {
          console.error("All Gemini API models entered overload or failed. Seamlessly activating beautiful heuristic template fallback.", fallbackErr.message || fallbackErr);
          const fallback = getLocalGeneratorFallback(text, translation, surahName || "Quran", surahNumber || 1, ayahNumber || 1);
          return res.json(fallback);
        }
      }

      const responseText = response?.text ? response.text.trim() : "";
      try {
        const parsedStyle = JSON.parse(responseText);
        return res.json({ success: true, aiRecommended: true, style: parsedStyle });
      } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", responseText, e);
        return res.json(getLocalGeneratorFallback(text, translation, surahName || "Quran", surahNumber || 1, ayahNumber || 1));
      }
    } catch (err: any) {
      console.error("API Route Error:", err);
      res.status(500).json({ error: err.message || "An error occurred on the AI model API" });
    }
  });

  // Proxy to fetch all Quran verses of a surah in authentic Uthmani script
  app.get("/api/quran/surah", async (req, res) => {
    try {
      const { surah } = req.query;
      if (!surah) {
        return res.status(400).json({ error: "Missing surah query parameter" });
      }

      const sNum = Number(surah);
      const url = `https://api.alquran.cloud/v1/surah/${sNum}/quran-uthmani`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 200 && data.data && data.data.ayahs) {
        const ayahsOutput = data.data.ayahs.map((ayah: any) => {
          let verseText = ayah.text || "";
          const aNum = Number(ayah.numberInSurah);
          // Strip Bismillah prefix if it is Ayah 1 of any Surah except Al-Fatihah or At-Tawbah
          if (sNum !== 1 && sNum !== 9 && aNum === 1) {
            const words = verseText.trim().split(/\s+/);
            if (words.length >= 4 && (words[0].startsWith("بِسْمِ") || words[0] === "بِسْمِ")) {
              verseText = words.slice(4).join(" ");
            }
          }
          return {
            numberInSurah: aNum,
            text: verseText
          };
        });

        return res.json({ success: true, ayahs: ayahsOutput });
      } else {
        return res.status(404).json({ error: "Surah not found on Alquran.cloud" });
      }
    } catch (err: any) {
      console.error("Proxy error fetching surah from server-side:", err);
      res.status(500).json({ error: "Failed to load Quran surah from central index" });
    }
  });

  // Proxy to fetch Quran verse details to bypass any browser CORS or connectivity blocks
  app.get("/api/quran/verse", async (req, res) => {
    try {
      const { surah, ayah } = req.query;
      if (!surah || !ayah) {
        return res.status(400).json({ error: "Missing surah or ayah query parameters" });
      }

      // Fetch authentic Uthmani script
      const arabicUrl = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/quran-uthmani`;
      const arRes = await fetch(arabicUrl);
      const arData = await arRes.json();

      // Fetch English translation (Edition: English Sahih International)
      const translationUrl = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.sahih`;
      const transRes = await fetch(translationUrl);
      const transData = await transRes.json();

      if (arData.code === 200 && transData.code === 200) {
        const absoluteIndex = arData.data.number || 1;
        let verseText = arData.data.text || "";
        const sNum = Number(surah);
        const aNum = Number(ayah);

        // Strip Bismillah prefix if it is Ayah 1 of any Surah except Al-Fatihah (1) or At-Tawbah (9)
        if (sNum !== 1 && sNum !== 9 && aNum === 1) {
          const words = verseText.trim().split(/\s+/);
          if (words.length >= 4 && (words[0].startsWith("بِسْمِ") || words[0] === "بِسْمِ")) {
            verseText = words.slice(4).join(" ");
          }
        }

        const result = {
          numberInSurah: aNum,
          text: verseText,
          translation: transData.data.text,
          audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${absoluteIndex}.mp3`,
          surahName: arData.data.surah.englishName,
          surahNumber: sNum,
          absoluteAyahIndex: absoluteIndex
        };
        return res.json({ success: true, data: result });
      } else {
        return res.status(404).json({ error: "Ayah not found on Alquran.cloud central index" });
      }
    } catch (err: any) {
      console.error("Proxy error fetching verse from server-side:", err);
      res.status(500).json({ error: "Failed to load Quran verses from central index" });
    }
  });

  // Proxy endpoint to stream audio and bypass CORS blocks on <audio> elements with crossOrigin="anonymous"
  app.get("/api/audio-proxy", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(400).send("Missing target audio url");
      }

      const decodedUrl = decodeURIComponent(url);
      if (!decodedUrl.startsWith("http://") && !decodedUrl.startsWith("https://")) {
        return res.status(400).send("Invalid target protocol");
      }

      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      };
      
      if (req.headers.range) {
        headers["Range"] = req.headers.range;
      }

      console.log(`[Audio Proxy] Streaming: ${decodedUrl} - Range: ${req.headers.range || "none"}`);
      const audioResponse = await fetch(decodedUrl, { headers });
      
      if (!audioResponse.ok && audioResponse.status !== 206) {
        return res.status(audioResponse.status).send(`Failed to read remote media stream: ${audioResponse.statusText}`);
      }

      const status = audioResponse.status;
      const contentType = audioResponse.headers.get("content-type") || "audio/mpeg";
      const arrayBuffer = await audioResponse.arrayBuffer();

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");
      res.setHeader("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length");
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      if (audioResponse.headers.has("content-range")) {
        res.setHeader("Content-Range", audioResponse.headers.get("content-range")!);
      }
      if (audioResponse.headers.has("accept-ranges")) {
        res.setHeader("Accept-Ranges", audioResponse.headers.get("accept-ranges")!);
      } else {
        res.setHeader("Accept-Ranges", "bytes");
      }
      if (audioResponse.headers.has("content-length")) {
        res.setHeader("Content-Length", audioResponse.headers.get("content-length")!);
      }

      return res.status(status).send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error("[Audio Proxy] Exception:", err);
      return res.status(500).send(`Server-side media stream exception: ${err.message}`);
    }
  });

  // Local rule-based layout generator as fallback
  function getLocalGeneratorFallback(text: string, translation: string, surahName: string, surahNum: number, ayahNum: number) {
    const textLower = translation.toLowerCase();
    let bgVideoId = "clouds-sunset";
    let templateId = "minimal-dark";
    let textColor = "#FFFFFF";
    let textShadowColor = "rgba(0, 0, 0, 0.85)";
    let textGlowColor = "rgba(255, 255, 255, 0.1)";
    let textGlowBlur = 0;
    let videoOpacity = 85;
    let videoBrightness = 32;
    let textPosition = 50;
    let aestheticTitle = "Sovereign Divine Wisdom";
    let reflectionPrompt = "A profound divine reminder calling hearts back to guidance and patience.";

    if (textLower.includes("water") || textLower.includes("sea") || textLower.includes("ocean") || textLower.includes("river") || textLower.includes("stream")) {
      bgVideoId = "ocean-aerial";
      templateId = "nature-reflection";
      textColor = "#E0F2F1";
      textGlowColor = "#81C784";
      textGlowBlur = 4;
      aestheticTitle = "The Flow of Divine Mercy";
      reflectionPrompt = "Like pure rainfall and vast seas, Allah's grace revives barren soil and dry hearts.";
    } else if (textLower.includes("rain") || textLower.includes("drop") || textLower.includes("sky") || textLower.includes("cloud") || textLower.includes("heaven")) {
      bgVideoId = "rain-window";
      templateId = "cinematic-black";
      videoBrightness = 20;
      videoOpacity = 90;
      textColor = "#FAFAFA";
      textGlowColor = "rgba(255, 255, 255, 0.25)";
      textGlowBlur = 3;
      aestheticTitle = "Blessings from Above";
      reflectionPrompt = "Every skyward storm and rainfall shower carries measured provisions for humankind.";
    } else if (textLower.includes("mountain") || textLower.includes("earth") || textLower.includes("firm") || textLower.includes("rock")) {
      bgVideoId = "mountain-aerial";
      templateId = "golden-islamic";
      textColor = "#F3C65F";
      textGlowColor = "#D4AF37";
      textGlowBlur = 5;
      aestheticTitle = "Steadfast Faith & Pillars";
      reflectionPrompt = "Anchor your soul in absolute reliance upon the Lord, taller and firmer than mountains.";
    } else if (textLower.includes("mercy") || textLower.includes("merciful") || textLower.includes("forgive") || textLower.includes("compassion")) {
      bgVideoId = "forest-sunbeams";
      templateId = "elegant-white";
      textColor = "#1E293B"; // High contrast slate
      textShadowColor = "rgba(255, 255, 255, 0.7)";
      videoOpacity = 45;
      videoBrightness = 85;
      aestheticTitle = "All-Compassionate Forgiveness";
      reflectionPrompt = "His doors of mercy are never locked. Drop your burdens and walk into His light.";
    } else if (textLower.includes("light") || textLower.includes("glowing") || textLower.includes("sun") || textLower.includes("moon") || textLower.includes("star") || textLower.includes("bright")) {
      bgVideoId = "cinematic-particles";
      templateId = "golden-islamic";
      textColor = "#F3C65F";
      textGlowColor = "#D4AF37";
      textGlowBlur = 6;
      aestheticTitle = "The Radiance of Truth";
      reflectionPrompt = "The light of the Quran penetrates dark thoughts, radiating celestial peace across the soul.";
    } else if (textLower.includes("believe") || textLower.includes("believers") || textLower.includes("pray") || textLower.includes("mosque") || textLower.includes("worship")) {
      bgVideoId = "mosque-illumination";
      templateId = "mosque-night";
      textColor = "#ECEFF1";
      textGlowColor = "#4DB6AC"; // teal
      textGlowBlur = 6;
      aestheticTitle = "Serenade of Divine Worship";
      reflectionPrompt = "Find ultimate healing, peace, and spiritual refuge within silent heart-felt prostrations.";
    }

    return {
      success: true,
      aiRecommended: false,
      style: {
        bgVideoId,
        templateId,
        aestheticTitle,
        reflectionPrompt,
        textColor,
        textShadowColor,
        textShadowBlur: 10,
        textGlowColor,
        textGlowBlur,
        videoOpacity,
        videoBrightness,
        textPosition,
        fontName: "Amiri",
        showTranslation: true
      }
    };
  }

  // Vite Integration Middleware Setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fullstack Quran Shorts Maker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
