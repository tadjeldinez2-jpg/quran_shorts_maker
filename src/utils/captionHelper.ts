import { SelectedVerseInfo, VerseData } from "../types";

export interface WordTiming {
  word: string;
  start: number;
  end: number;
  index: number;
}

export interface SegmentTiming {
  words: WordTiming[];
  start: number;
  end: number;
  text: string;
  index: number;
  translation: string;
}

/**
 * Parses Uthmani text of a verse and distributes duration proportionally by character length
 */
export function getWordTimings(text: string, duration: number): WordTiming[] {
  const wordsArray = text.trim().split(/\s+/).filter(Boolean);
  if (wordsArray.length === 0) return [];

  const charCounts = wordsArray.map((w) => w.length);
  const totalChars = charCounts.reduce((sum, val) => sum + val, 0);

  let accumulatedTime = 0;
  return wordsArray.map((word, index) => {
    // Proportional time share with a minimum of 0.2s per word to avoid super short cutoffs
    const wordRatio = totalChars > 0 ? charCounts[index] / totalChars : 1 / wordsArray.length;
    const wordDuration = duration * wordRatio;
    const start = accumulatedTime;
    const end = accumulatedTime + wordDuration;
    accumulatedTime = end;

    return {
      word,
      start,
      end,
      index,
    };
  });
}

/**
 * Group sequential word timing structures into contiguous readable segments of max segment length (default: 5 words).
 * Also maps translations proportionally so that they correspond directly with the segment.
 */
export function getSegmentTimings(
  wordTimings: WordTiming[],
  translation: string,
  maxSegmentWords = 5
): SegmentTiming[] {
  if (wordTimings.length === 0) return [];

  const totalWords = wordTimings.length;
  // Compute best balance group sizes (e.g. for 8 words, split into two 4-word segments instead of 5 & 3)
  const segmentsCount = Math.ceil(totalWords / maxSegmentWords);
  const wordsPerSegment = Math.ceil(totalWords / segmentsCount);

  const segments: SegmentTiming[] = [];
  const translationWords = translation.trim().split(/\s+/).filter(Boolean);

  let segmentIdx = 0;
  for (let i = 0; i < totalWords; i += wordsPerSegment) {
    const chunkWords = wordTimings.slice(i, i + wordsPerSegment);
    if (chunkWords.length === 0) continue;

    const start = chunkWords[0].start;
    const end = chunkWords[chunkWords.length - 1].end;
    const text = chunkWords.map((w) => w.word).join(" ");

    // Handle translation proportional slicing
    const tStartIdx = Math.floor((i / totalWords) * translationWords.length);
    const tEndIdx = Math.floor(((i + wordsPerSegment) / totalWords) * translationWords.length);
    const chunkTranslation = translationWords.slice(tStartIdx, Math.max(tEndIdx, tStartIdx + 1)).join(" ");

    segments.push({
      words: chunkWords,
      start,
      end,
      text,
      index: segmentIdx++,
      translation: chunkTranslation,
    });
  }

  return segments;
}

/**
 * Retrieves the active segment and active word based on current play position
 */
export function findActiveTiming(
  segments: SegmentTiming[],
  currentTime: number
): { activeSegment: SegmentTiming | null; activeWord: WordTiming | null } {
  if (segments.length === 0) return { activeSegment: null, activeWord: null };

  // Loop back if currentTime exceeded normal duration bounds
  const maxEndTime = segments[segments.length - 1].end;
  const normalizedTime = currentTime % (maxEndTime || 1);

  // Find active segment
  let activeSegment = segments.find(
    (s) => normalizedTime >= s.start && normalizedTime < s.end
  );

  // Fallback for end boundary anomalies
  if (!activeSegment && segments.length > 0) {
    if (normalizedTime >= maxEndTime - 0.1) {
      activeSegment = segments[segments.length - 1];
    } else {
      activeSegment = segments[0];
    }
  }

  if (!activeSegment) return { activeSegment: null, activeWord: null };

  // Find active word in active segment
  const activeWord = activeSegment.words.find(
    (w) => normalizedTime >= w.start && normalizedTime <= w.end
  ) || activeSegment.words[0];

  return { activeSegment, activeWord };
}

/**
 * Returns the candidate URLs to search for a specific verse's audio and reciter
 */
export function getReciterAudioCandidates(
  surahNum: number, 
  ayahNum: number, 
  absoluteAyahIndex: number, 
  reciterId: string
): string[] {
  const urls: string[] = [];
  const surahStr = String(surahNum).padStart(3, "0");
  const ayahStr = String(ayahNum).padStart(3, "0");
  const filename = `${surahStr}${ayahStr}.mp3`;
  
  let everyAyahFolder = "Alafasy_128kbps";
  if (reciterId === "ar.alafasy") everyAyahFolder = "Alafasy_128kbps";
  else if (reciterId === "ar.alijaber") everyAyahFolder = "Ali_Jaber_64kbps";
  else if (reciterId === "ar.minshawi") everyAyahFolder = "Minshawi_Murattal_128kbps";
  else if (reciterId === "ar.husary") everyAyahFolder = "Hussary_128kbps";
  else if (reciterId === "ar.abdulsamad") everyAyahFolder = "Abdul_Basit_Murattal_64kbps";
  else if (reciterId === "ar.maheralmuaiqly") everyAyahFolder = "MaherAlMuaiqly128kbps";

  const everyAyahUrl = `https://everyayah.com/data/${everyAyahFolder}/${filename}`;
  const mirrorUrl = `https://mirrors.quranicaudio.com/everyayah/data/${everyAyahFolder}/${filename}`;

  const islamicBitrate = reciterId === "ar.abdulsamad" ? "64" : "128";
  const islamicNetworkUrl = `https://cdn.islamic.network/quran/audio/${islamicBitrate}/${reciterId}/${absoluteAyahIndex}.mp3`;

  // Detect static hosting environments (Netlify, Vercel, GitHub Pages) or dynamic checked backend absences
  const isStaticPlatform = typeof window !== "undefined" && (
    window.location.hostname.includes("netlify.app") ||
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("github.io") ||
    (window as any).__hasBackend === false
  );

  if (!isStaticPlatform) {
    // 1. Proxied official Islamic Network CDN URL (Highly reliable)
    if (reciterId !== "ar.alijaber") {
      urls.push(`/api/audio-proxy?url=${encodeURIComponent(islamicNetworkUrl)}`);
    }

    // 2. Proxied standard everyayah.com mp3 file
    urls.push(`/api/audio-proxy?url=${encodeURIComponent(everyAyahUrl)}`);
  }

  // 3. Fallback: Direct Islamic Network CDN URL
  if (reciterId !== "ar.alijaber") {
    urls.push(islamicNetworkUrl);
  }

  // 4. Fallback: Direct EveryAyah URL
  urls.push(everyAyahUrl);

  // 5. Fallback: Direct Mirror URL
  urls.push(mirrorUrl);

  return urls;
}

/**
 * Loads an audio URL in the background to verify its existence and retrieve exact duration
 */
export function verifyAudioUrl(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    
    // Set a timeout of 15 seconds to prevent hanging
    const timeout = setTimeout(() => {
      audio.src = "";
      reject(new Error("Audio load timeout"));
    }, 15000);

    const cleanup = () => {
      clearTimeout(timeout);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
    };

    const onLoaded = () => {
      const duration = audio.duration;
      cleanup();
      if (duration && duration > 0) {
        resolve(duration);
      } else {
        reject(new Error("Loaded audio has 0 or invalid duration"));
      }
    };

    const onError = () => {
      cleanup();
      reject(new Error("Audio failed to load or does not exist"));
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
    audio.src = url;
    audio.load();
  });
}

/**
 * Tries candidates sequentially and resolves with the first one that exists and loads
 */
export async function verifyAndGetAudioDuration(candidates: string[]): Promise<{ url: string; duration: number }> {
  let lastError = new Error("No candidate URLs provided");
  for (const url of candidates) {
    try {
      const duration = await verifyAudioUrl(url);
      return { url, duration };
    } catch (e: any) {
      lastError = e;
      console.warn(`Candidate URL failed to verify: ${url}. Error: ${e.message}`);
    }
  }
  throw lastError;
}

/**
 * Generates combined word timings and segments across multiple verses
 */
export function getCombinedCaptions(
  selectedVerses: SelectedVerseInfo[],
  maxSegmentWords: number = 5
): { wordTimings: WordTiming[]; segments: SegmentTiming[] } {
  const wordTimings: WordTiming[] = [];
  const segments: SegmentTiming[] = [];
  
  let accumulatedTime = 0;
  let wordGlobalIndex = 0;
  let segmentGlobalIndex = 0;
  
  selectedVerses.forEach(({ verse, duration }) => {
    // Generate word timings for this verse
    const localWordTimings = getWordTimings(verse.text, duration);
    
    // Shift word timings and add to global list
    const shiftedWordTimings = localWordTimings.map((wt) => {
      return {
        ...wt,
        start: wt.start + accumulatedTime,
        end: wt.end + accumulatedTime,
        index: wordGlobalIndex++
      };
    });
    
    wordTimings.push(...shiftedWordTimings);
    
    // Generate segment timings for this verse
    const localSegments = getSegmentTimings(shiftedWordTimings, verse.translation, maxSegmentWords);
    
    localSegments.forEach((seg) => {
      segments.push({
        ...seg,
        index: segmentGlobalIndex++
      });
    });
    
    accumulatedTime += duration;
  });
  
  return { wordTimings, segments };
}

/**
 * Finds which verse is currently active based on global time
 */
export function findActiveVerse(
  selectedVerses: SelectedVerseInfo[],
  currentTime: number
): SelectedVerseInfo | null {
  if (selectedVerses.length === 0) return null;
  
  let accumulatedTime = 0;
  for (const item of selectedVerses) {
    if (currentTime >= accumulatedTime && currentTime < accumulatedTime + item.duration) {
      return item;
    }
    accumulatedTime += item.duration;
  }
  
  return selectedVerses[selectedVerses.length - 1];
}

/**
 * Recalculates combined segments dynamically on manual word-levels adjustment
 */
export function getCombinedSegmentsFromWordTimings(
  wordTimings: WordTiming[],
  selectedVerses: SelectedVerseInfo[],
  maxSegmentWords: number = 5
): SegmentTiming[] {
  const segments: SegmentTiming[] = [];
  let wordIndexOffset = 0;
  let segmentGlobalIndex = 0;
  
  selectedVerses.forEach(({ verse }) => {
    const verseWords = verse.text.trim().split(/\s+/).filter(Boolean);
    const numWords = verseWords.length;
    
    const verseWordTimings = wordTimings.slice(wordIndexOffset, wordIndexOffset + numWords);
    wordIndexOffset += numWords;
    
    if (verseWordTimings.length > 0) {
      const localSegments = getSegmentTimings(verseWordTimings, verse.translation, maxSegmentWords);
      localSegments.forEach((seg) => {
        segments.push({
          ...seg,
          index: segmentGlobalIndex++
        });
      });
    }
  });
  
  return segments;
}


