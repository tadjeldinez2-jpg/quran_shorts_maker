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

  // API Route - Pexels Shariah-Compliant 9:16 Vertical Background Library Proxy
  app.get("/api/pexels/search", async (req, res) => {
    try {
      const categoryParam = (req.query.category as string) || "All";
      const userQuery = (req.query.query as string) || "";
      const mediaType = ((req.query.mediaType as string) === "photos" ? "photos" : "videos") as "videos" | "photos";
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 12;

      const apiKey = process.env.PEXELS_API_KEY;
      const isKeyConfigured = apiKey && apiKey.trim() !== "" && apiKey !== "MY_PEXELS_API_KEY";

      // Curated stunning portrait Nature background fallbacks (Unsplash portrait images and Mixkit verified 9:16 video loops)
      const mockFallbacks: Record<string, Record<string, any[]>> = {
        photos: {
          "Mountains": [
            { id: "fb-m1", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606", src: { medium: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Sourced Mountains", alt: "Beautiful Snow Peaks Peaks Range" },
            { id: "fb-m2", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b", src: { medium: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Majestic Summit", alt: "Green Valley Slopes Mountain Skyline" }
          ],
          "Ocean": [
            { id: "fb-o1", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0", src: { medium: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Aerial Waves", alt: "Ethereal Aerial Ocean Waves Sea Ripple" },
            { id: "fb-o2", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1519046904884-53103b34b206", src: { medium: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Coast Waters", alt: "Quiet Teal Sandy Coast Water Sunset" }
          ],
          "Forest": [
            { id: "fb-f1", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1511497584788-876760111969", src: { medium: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Ethereal Pines", alt: "Misty Green Pine Forest Woods Background" },
            { id: "fb-f2", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1448375240586-882707db888b", src: { medium: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Morning Woods", alt: "Sunlit Forest Run Trunks Moss Autumn" }
          ],
          "Rain": [
            { id: "fb-r1", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0", src: { medium: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Ambient Rain", alt: "Raindrops On Window Glass Glow bokeh" },
            { id: "fb-r2", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1437419764061-2473afe69fc2", src: { medium: "https://images.unsplash.com/photo-1437419764061-2473afe69fc2?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1437419764061-2473afe69fc2?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Gloom Drops", alt: "Moody Rainfall Window Nature Wet Glass" }
          ],
          "Sky": [
            { id: "fb-s1", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c", src: { medium: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Sky Heights", alt: "Soft Dreamy Celestial White Clouds Sky" },
            { id: "fb-s2", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071", src: { medium: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Golden Horizon", alt: "Twilight Cloud Horizon Sunset Pink Heaven" }
          ],
          "Desert": [
            { id: "fb-d1", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9", src: { medium: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Sahara Dunes", alt: "Soaring Sand Dunes Scorched Earth Desert" },
            { id: "fb-d2", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750", src: { medium: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Calm desert", alt: "Deep Desert Stillness Evening Orange Lights" }
          ],
          "Minimal": [
            { id: "fb-mn1", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc", src: { medium: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Dark Leaves", alt: "Dark Shadows Leafage Minimalist Forest Flora" },
            { id: "fb-mn2", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1502481851512-e9e2529bbbf9", src: { medium: "https://images.unsplash.com/photo-1502481851512-e9e2529bbbf9?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1502481851512-e9e2529bbbf9?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Obsidian Surf", alt: "Deep Obsidian Calm Silent Ocean Ripple" }
          ],
          "Abstract": [
            { id: "fb-a1", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab", src: { medium: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Fluid Cosmos", alt: "Ethereal Dusk Aura Purple Liquid Pastel Glow" },
            { id: "fb-a2", width: 1080, height: 1920, url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe", src: { medium: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=350&h=620&q=80", original: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&h=1920&q=80" }, photographer: "Spiritual Aura", alt: "Fluid Golden Silk Satin Swirl background texture" }
          ]
        },
        videos: {
          "Mountains": [
            { id: "fb-v-m1", width: 1080, height: 1920, url: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-snowy-mountain-peaks-shining-in-the-sun-41908-large.mp4", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=350&q=80", user: { name: "Mixkit Cinematic" }, video_files: [{ link: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-snowy-mountain-peaks-shining-in-the-sun-41908-large.mp4", height: 1920, width: 1080 }] }
          ],
          "Ocean": [
            { id: "fb-v-o1", width: 1080, height: 1920, url: "https://assets.mixkit.co/videos/preview/mixkit-top-view-of-waves-crashing-on-a-sandy-beach-41662-large.mp4", image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=350&q=80", user: { name: "Mixkit Aerials" }, video_files: [{ link: "https://assets.mixkit.co/videos/preview/mixkit-top-view-of-waves-crashing-on-a-sandy-beach-41662-large.mp4", height: 1920, width: 1080 }] }
          ],
          "Forest": [
            { id: "fb-v-f1", width: 1080, height: 1920, url: "https://assets.mixkit.co/videos/preview/mixkit-beautiful-aerial-view-of-a-dense-forest-and-mountains-41712-large.mp4", image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=350&q=80", user: { name: "Mixkit Forests" }, video_files: [{ link: "https://assets.mixkit.co/videos/preview/mixkit-beautiful-aerial-view-of-a-dense-forest-and-mountains-41712-large.mp4", height: 1920, width: 1080 }] }
          ],
          "Rain": [
            { id: "fb-v-r1", width: 1080, height: 1920, url: "https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-window-pane-shining-with-lights-40019-large.mp4", image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=350&q=80", user: { name: "Mixkit Weather" }, video_files: [{ link: "https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-window-pane-shining-with-lights-40019-large.mp4", height: 1920, width: 1080 }] }
          ],
          "Sky": [
            { id: "fb-v-s1", width: 1080, height: 1920, url: "https://assets.mixkit.co/videos/preview/mixkit-clouds-moving-fast-under-a-blue-sky-40294-large.mp4", image: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=350&q=80", user: { name: "Mixkit Sky" }, video_files: [{ link: "https://assets.mixkit.co/videos/preview/mixkit-clouds-moving-fast-under-a-blue-sky-40294-large.mp4", height: 1920, width: 1080 }] }
          ],
          "Desert": [
            { id: "fb-v-d1", width: 1080, height: 1920, url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-gold-particles-floating-in-the-dark-42838-large.mp4", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=350&q=80", user: { name: "Mixkit Desert" }, video_files: [{ link: "https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-gold-particles-floating-in-the-dark-42838-large.mp4", height: 1920, width: 1080 }] }
          ],
          "Minimal": [
            { id: "fb-v-mn1", width: 1080, height: 1920, url: "https://player.vimeo.com/external/371433846.sd.mp4?s=23ec2dbe34d5216d330fd0b3815e9e0ff9f91195&profile_id=165&oauth2_token_id=57447761", image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=350&q=80", user: { name: "Sufi Dust Loop" }, video_files: [{ link: "https://player.vimeo.com/external/371433846.sd.mp4?s=23ec2dbe34d5216d330fd0b3815e9e0ff9f91195&profile_id=165&oauth2_token_id=57447761", height: 1920, width: 1080 }] }
          ],
          "Abstract": [
            { id: "fb-v-a1", width: 1080, height: 1920, url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-gold-particles-floating-in-the-dark-42838-large.mp4", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=350&q=80", user: { name: "Celestial Dust" }, video_files: [{ link: "https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-gold-particles-floating-in-the-dark-42838-large.mp4", height: 1920, width: 1080 }] }
          ]
        }
      };

      if (!isKeyConfigured) {
        // Return stunning pre-screened vertical fallback nature assets directly
        console.warn("[Pexels Proxy] API Key not set. Using beautiful pre-screened fallback background loops.");
        let matchingItems: any[] = [];
        if (categoryParam === "All") {
          // Merge all categories for browsing
          const source = mockFallbacks[mediaType];
          Object.keys(source).forEach(cat => {
            matchingItems.push(...source[cat]);
          });
        } else {
          matchingItems = mockFallbacks[mediaType][categoryParam] || mockFallbacks[mediaType]["Mountains"];
        }

        // Apply simple fuzzy matching if query is typed
        if (userQuery.trim() !== "") {
          const q = userQuery.toLowerCase();
          matchingItems = matchingItems.filter(item => {
            const label = (item.alt || item.photographer || item.user?.name || "").toLowerCase();
            return label.includes(q);
          });
        }

        return res.json({
          success: true,
          mediaType,
          usingFallback: true,
          results: matchingItems
        });
      }

      // Convert Categories to highly specialized vertical nature queries for beautiful Shariah-friendly outcomes
      const queryMap: Record<string, string> = {
        "Mountains": "mountains peaks cinematic landscape vertical",
        "Ocean": "ocean waves aerial sea water vertical",
        "Forest": "forest mist sunbeams lush foliage vertical",
        "Rain": "rain window aesthetic cinematic vertical",
        "Sky": "clouds sunset sky heavenly vertical",
        "Desert": "desert sand dunes landscape still vertical",
        "Minimal": "minimal nature textures calming background vertical",
        "Abstract": "abstract slow motion ambient light sparkles vertical"
      };

      // Construct final search term
      let searchToRun = userQuery;
      if (!searchToRun) {
        searchToRun = queryMap[categoryParam] || "beautiful quiet nature landscape vertical";
      } else {
        // Ensure vertical nature emphasis
        searchToRun = `${searchToRun} vertical landscape nature`;
      }

      const FORBIDDEN_WORDS = /\b(person|human|man|woman|people|girl|boy|face|silhouette|crowd|statue|sculpture|sculptures|statues|monument|feet|hands|eyes|posing|pose|hug|dance|party|bikini|swimsuit|underwear|model|couple|family|crowded|selfie|portrait|guy|lady|gentleman|child|baby|kid|kids|spectators|audience|monuments|cross|jesus|buddha|characters|animated|animator|skater|city|cities|office|cars|traffic|buildings)\b/i;

      // Heuristic Filter function
      const filterMedia = (items: any[], type: "photos" | "videos") => {
        return items.filter(item => {
          // 1. Text description / alt text check to enforce the strict living creature and human ban
          const textToScan = [
            type === "photos" ? (item.alt || "") : "",
            item.url || "",
            type === "photos" ? (item.photographer || "") : (item.user?.name || ""),
            // check tags if available
            Array.isArray(item.tags) ? item.tags.join(" ") : ""
          ].join(" ").toLowerCase();

          if (FORBIDDEN_WORDS.test(textToScan)) {
            return false;
          }

          // 2. Exact aspect ratio verify (must be vertical: height > width)
          if (type === "photos") {
            return item.height > item.width;
          } else {
            if (!item.video_files || item.video_files.length === 0) return false;
            // Check if there is at least one portrait resolution format video file
            const portraitFiles = item.video_files.filter((vf: any) => vf.height > vf.width);
            return portraitFiles.length > 0;
          }
        });
      };

      // Dynamic Fallback Try Engine for Pexels search query
      const fetchFromPexels = async (queryStr: string) => {
        const fetchUrl = mediaType === "photos"
          ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(queryStr)}&orientation=portrait&per_page=${perPage}&page=${page}`
          : `https://api.pexels.com/videos/search?query=${encodeURIComponent(queryStr)}&orientation=portrait&per_page=${perPage}&page=${page}`;

        console.log(`[Pexels Proxy API] Querying: ${fetchUrl}`);
        const response = await fetch(fetchUrl, {
          headers: {
            "Authorization": apiKey
          }
        });

        if (!response.ok) {
          throw new Error(`Pexels API responded with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const rawItems = mediaType === "photos" ? (data.photos || []) : (data.videos || []);
        let filtered = filterMedia(rawItems, mediaType);

        // Fallback System: If no 9:16 vertical content found, automatically try alternative search keywords!
        if (filtered.length === 0) {
          console.warn(`[Pexels Proxy] Zero valid 9:16 vertical / compliant assets returned for '${queryStr}'. Trying alternative fallback keywords.`);
          const fallbackKeywords = ["beautiful landscape vertical", "scenic background vertical", "nature quiet aesthetic vertical", "sky clouds slow motion vertical"];
          for (const kw of fallbackKeywords) {
            if (kw === queryStr) continue;
            const fallbackFetchUrl = mediaType === "photos"
              ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(kw)}&orientation=portrait&per_page=${perPage}&page=1`
              : `https://api.pexels.com/videos/search?query=${encodeURIComponent(kw)}&orientation=portrait&per_page=${perPage}&page=1`;

            console.log(`[Pexels Fallback Search] Trying keyword: ${kw}`);
            const fbResponse = await fetch(fallbackFetchUrl, {
              headers: { "Authorization": apiKey }
            });

            if (fbResponse.ok) {
              const fbData = await fbResponse.json();
              const fbItems = mediaType === "photos" ? (fbData.photos || []) : (fbData.videos || []);
              const fbFiltered = filterMedia(fbItems, mediaType);
              if (fbFiltered.length > 0) {
                console.log(`[Pexels Fallback Search] Successfully found ${fbFiltered.length} vertical assets under fallback: '${kw}'`);
                filtered = fbFiltered;
                break;
              }
            }
          }
        }

        return filtered;
      };

      const finalResults = await fetchFromPexels(searchToRun);

      res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour cache
      return res.json({
        success: true,
        mediaType,
        usingFallback: false,
        results: finalResults
      });

    } catch (err: any) {
      console.error("[Pexels Proxy Error] Exception:", err);
      return res.status(500).json({ error: `Failed to load backgrounds from Pexels API: ${err.message}` });
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
