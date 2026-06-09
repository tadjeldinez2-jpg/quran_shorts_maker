import { useState, useEffect, useRef } from "react";
import { Sparkles, Heart, Moon, Disc, AlertCircle, RefreshCw } from "lucide-react";
import VideoPlayer from "./components/VideoPlayer";
import ControlPanel from "./components/ControlPanel";
import { BACKGROUND_VIDEOS, RECITERS } from "./data/presets";
import { VerseData, VideoEditorSettings, BackgroundVideo, Reciter, SelectedVerseInfo } from "./types";
import {
  getWordTimings,
  getSegmentTimings,
  WordTiming,
  SegmentTiming,
  getCombinedCaptions,
  getCombinedSegmentsFromWordTimings,
  findActiveVerse,
  getReciterAudioCandidates,
  verifyAndGetAudioDuration
} from "./utils/captionHelper";

const INITIAL_SETTINGS: VideoEditorSettings = {
  textPosition: 45,
  textRightOffset: 0,
  fontSize: 27,
  fontName: "Amiri",
  alignment: "center",
  textColor: "#FFFFFF",
  textShadowColor: "rgba(0, 0, 0, 0.9)",
  textShadowBlur: 10,
  textGlowColor: "rgba(16, 185, 129, 0.2)",
  textGlowBlur: 4,
  videoBrightness: 32,
  videoOpacity: 85,
  animationType: "fade",
  showTranslation: true,
  translationColor: "#a7f3d0",
  translationFontSize: 15,
  translationFontName: "Inter",
  surahLabelColor: "#10b981",
  showSurahLabel: true,
  wordSpacing: 3,
  maxWordsPerSegment: 5,
  timingOffset: 0,
  playBismillahPrefix: true
};

export default function App() {
  const [selectedVerses, setSelectedVerses] = useState<SelectedVerseInfo[]>([]);
  const [settings, setSettings] = useState<VideoEditorSettings>(INITIAL_SETTINGS);
  const [selectedVideo, setSelectedVideo] = useState<BackgroundVideo>(BACKGROUND_VIDEOS[0]);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  
  // Synchronized Reciter Audio states
  const [reciterAudioTime, setReciterAudioTime] = useState<number>(0);
  const isReciterPlaying = isPlaying; // Single master state reference
  const [reciterError, setReciterError] = useState<string>("");
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  
  const audiosRef = useRef<HTMLAudioElement[]>([]);

  // Cache refs to solve any stale closure bugs in callback listeners & requestAnimationFrame loop
  const isPlayingRef = useRef<boolean>(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const reciterAudioTimeRef = useRef<number>(reciterAudioTime);
  useEffect(() => {
    reciterAudioTimeRef.current = reciterAudioTime;
  }, [reciterAudioTime]);

  const selectedVersesRef = useRef<SelectedVerseInfo[]>(selectedVerses);
  useEffect(() => {
    selectedVersesRef.current = selectedVerses;
  }, [selectedVerses]);

  // AI recommendations parameters
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aestheticTitle, setAestheticTitle] = useState<string>("Sovereign Divine Mercy");
  const [reflectionPrompt, setReflectionPrompt] = useState<string>("Turn back to the Lord with heart-felt gratitude and search for correct, ultimate guidance.");
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string>("");

  // Advanced Manual Timing Adjustments: States and History Undo/Redo Engine
  const [activeWordTimings, setActiveWordTimings] = useState<WordTiming[]>([]);
  const [timingHistory, setTimingHistory] = useState<WordTiming[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Derive dynamic stats
  const reciterAudioDuration = selectedVerses.reduce((sum, v) => sum + v.duration, 0);

  const findActiveVerseIndex = (currentTime: number) => {
    if (selectedVerses.length === 0) return 0;
    let accumulatedTime = 0;
    for (let i = 0; i < selectedVerses.length; i++) {
      const item = selectedVerses[i];
      if (currentTime >= accumulatedTime && currentTime < accumulatedTime + item.duration) {
        return i;
      }
      accumulatedTime += item.duration;
    }
    return selectedVerses.length - 1;
  };

  const getAccumulatedTimeBefore = (index: number) => {
    let sum = 0;
    for (let i = 0; i < index; i++) {
      sum += selectedVerses[i]?.duration || 0;
    }
    return sum;
  };

  const [currentVerseOverride, setCurrentVerseOverride] = useState<VerseData | null>(null);
  const activeVerseIndex = findActiveVerseIndex(reciterAudioTime);
  const currentVerse = currentVerseOverride || selectedVerses[activeVerseIndex]?.verse || null;
  const setCurrentVerse = (verse: VerseData | null) => {
    setCurrentVerseOverride(verse);
  };

  // Automatically manage Bismillah (Surah 1, Ayah 1) prefix based on settings and selected verses
  useEffect(() => {
    if (selectedVerses.length === 0) return;

    // Check if the first verse in selectedVerses is the Bismillah prefix (Surah 1, Ayah 1)
    const hasBismillahPrefix = selectedVerses[0].verse.surahNumber === 1 && selectedVerses[0].verse.numberInSurah === 1;

    // The user's intended selection of actual surah verses
    const userVerses = hasBismillahPrefix ? selectedVerses.slice(1) : selectedVerses;

    if (userVerses.length === 0) return;

    const firstUserVerse = userVerses[0].verse;
    
    // Bismillah should be played if the user wants it AND the first actual verse is Ayah 1 of any Surah except Al-Fatihah (1) or At-Tawbah (9)
    const shouldHaveBismillah = settings.playBismillahPrefix && 
                                firstUserVerse.numberInSurah === 1 && 
                                firstUserVerse.surahNumber !== 1 && 
                                firstUserVerse.surahNumber !== 9;

    if (shouldHaveBismillah && !hasBismillahPrefix) {
      // Fetch and prepend the Bismillah verse for the active reciter
      const fetchAndPrependBismillah = async () => {
        setIsLoadingAudio(true);
        try {
          const bismillahVerse: VerseData = {
            surahNumber: 1,
            numberInSurah: 1,
            text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
            translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
            audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
            surahName: "Al-Fatihah",
            absoluteAyahIndex: 1
          };

          const candidates = getReciterAudioCandidates(1, 1, 1, selectedReciter.identifier);
          const verified = await verifyAndGetAudioDuration(candidates);
          
          const prependedItem: SelectedVerseInfo = {
            verse: bismillahVerse,
            duration: verified.duration,
            audioUrl: verified.url
          };

          setSelectedVerses([prependedItem, ...userVerses]);
        } catch (err) {
          console.warn("Could not prepend Bismillah audio track automatically:", err);
        } finally {
          setIsLoadingAudio(false);
        }
      };

      fetchAndPrependBismillah();
    } else if (!shouldHaveBismillah && hasBismillahPrefix) {
      // Remove the Bismillah prefix from selectedVerses
      setSelectedVerses(userVerses);
    }
  }, [selectedVerses, settings.playBismillahPrefix, selectedReciter]);

  // Initialize and reset timing state whenever selectedVerses or reciter or maxWordsPerSegment changes
  useEffect(() => {
    if (selectedVerses.length === 0) return;
    const combined = getCombinedCaptions(selectedVerses, settings.maxWordsPerSegment || 5);
    setActiveWordTimings(combined.wordTimings);
    setTimingHistory([combined.wordTimings]);
    setHistoryIndex(0);
  }, [selectedVerses, selectedReciter, settings.maxWordsPerSegment]);

  // Compute live custom segments dynamically
  const customSegments = getCombinedSegmentsFromWordTimings(activeWordTimings, selectedVerses, settings.maxWordsPerSegment || 5);

  // Mutator helper that pushes new snapshot onto history for clean undo/redo actions
  const applyTimingMutation = (newTimings: WordTiming[]) => {
    const updatedHistory = timingHistory.slice(0, historyIndex + 1);
    updatedHistory.push(newTimings);
    setTimingHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setActiveWordTimings(newTimings);
  };

  // 1. Single Word/Syllable adjustment handler
  const handleUpdateWordTiming = (wordIndex: number, property: "start" | "end", newValue: number) => {
    const clampedValue = Math.max(0, Math.min(reciterAudioDuration, newValue));
    const mutated = activeWordTimings.map((wt, idx) => {
      if (idx === wordIndex) {
        return {
          ...wt,
          [property]: clampedValue
        };
      }
      return wt;
    });
    applyTimingMutation(mutated);
  };

  // 2. Multi-word Segment shift adjustment handler
  const handleShiftSegmentTiming = (wordIndices: number[], offset: number) => {
    const mutated = activeWordTimings.map((wt, idx) => {
      if (wordIndices.includes(idx)) {
        const shiftedStart = Math.max(0, Math.min(reciterAudioDuration, wt.start + offset));
        const shiftedEnd = Math.max(0, Math.min(reciterAudioDuration, wt.end + offset));
        return {
          ...wt,
          start: shiftedStart,
          end: shiftedEnd
        };
      }
      return wt;
    });
    applyTimingMutation(mutated);
  };

  // Audio position seeking helper
  const handleSeekAudio = (time: number) => {
    const clamped = Math.max(0, Math.min(reciterAudioDuration, time));
    setReciterAudioTime(clamped);
    
    const activeIdx = findActiveVerseIndex(clamped);
    const S_k = getAccumulatedTimeBefore(activeIdx);
    const relativeTime = clamped - S_k;

    // Pause all other audio elements in pool
    audiosRef.current.forEach((audio, idx) => {
      if (idx !== activeIdx) {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (_) {}
      }
    });

    const activeAudio = audiosRef.current[activeIdx];
    if (activeAudio) {
      activeAudio.currentTime = Math.max(0, relativeTime);
      if (isPlayingRef.current) {
        activeAudio.play().catch(err => console.warn("Seek-play failed:", err));
      }
    }
  };

  // 3. History controls (Undo, Redo, Reset)
  const handleUndoTiming = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      setActiveWordTimings(timingHistory[targetIndex]);
    }
  };

  const handleRedoTiming = () => {
    if (historyIndex < timingHistory.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      setActiveWordTimings(timingHistory[targetIndex]);
    }
  };

  const handleResetToAutoTiming = () => {
    if (selectedVerses.length === 0) return;
    const combined = getCombinedCaptions(selectedVerses, settings.maxWordsPerSegment || 5);
    applyTimingMutation(combined.wordTimings);
  };

  // Manage multiple HTMLAudioElements matching the sequence of selectedVerses
  useEffect(() => {
    // 1. Destroy and cleanup existing audios from pool
    audiosRef.current.forEach((audio) => {
      try {
        audio.pause();
        audio.src = "";
      } catch (_) {}
    });
    audiosRef.current = [];

    if (selectedVerses.length === 0) return;

    // 2. Instantiate new HTMLAudioElements for current verses
    const audios = selectedVerses.map((item, index) => {
      const audio = new Audio(item.audioUrl);
      audio.crossOrigin = "anonymous";
      
      const handleEnded = () => {
        const nextIdx = index + 1;
        const currentVerses = selectedVersesRef.current;
        if (nextIdx < currentVerses.length) {
          try {
            audio.pause();
            const nextAudio = audiosRef.current[nextIdx];
            if (nextAudio) {
              nextAudio.currentTime = 0;
              const nextAccum = getAccumulatedTimeBefore(nextIdx);
              reciterAudioTimeRef.current = nextAccum;
              setReciterAudioTime(nextAccum);
              if (isPlayingRef.current) {
                nextAudio.play().catch(err => console.warn("Sequential playback failed:", nextIdx, err));
              }
            }
          } catch (err) {
            console.warn("Chain playback transition error:", err);
          }
        } else {
          reciterAudioTimeRef.current = 0;
          setReciterAudioTime(0);
          audiosRef.current.forEach(a => {
            try { a.pause(); a.currentTime = 0; } catch (_) {}
          });
          setIsPlaying(false);
        }
      };

      const handleError = (e: any) => {
        console.warn(`Audio element fail in pool (Index: ${index}):`, e);
      };

      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      return audio;
    });

    audiosRef.current = audios;
    (window as any).__reciterAudios = audios;

    if (isPlayingRef.current) {
      const activeIdx = findActiveVerseIndex(reciterAudioTimeRef.current);
      const activeAudio = audiosRef.current[activeIdx];
      if (activeAudio) {
        const S_k = getAccumulatedTimeBefore(activeIdx);
        activeAudio.currentTime = Math.max(0, reciterAudioTimeRef.current - S_k);
        activeAudio.play().catch(err => console.warn("App resume playback page change failing:", err));
      }
    }

    return () => {
      audios.forEach((audio) => {
        try {
          audio.pause();
          audio.src = "";
        } catch (_) {}
      });
      audiosRef.current = [];
      (window as any).__reciterAudios = null;
    };
  }, [selectedVerses, selectedReciter]);

  // Keep recitation audio in sync with the global isPlaying state
  useEffect(() => {
    if (!isPlaying) {
      audiosRef.current.forEach((audio) => {
        try { audio.pause(); } catch (_) {}
      });
    } else {
      const activeIdx = findActiveVerseIndex(reciterAudioTimeRef.current);
      const activeAudio = audiosRef.current[activeIdx];
      if (activeAudio) {
        const S_k = getAccumulatedTimeBefore(activeIdx);
        activeAudio.currentTime = Math.max(0, reciterAudioTimeRef.current - S_k);
        activeAudio.play().catch((err) => {
          if (err.name === "AbortError" || err.message?.includes("interrupted")) {
            return;
          }
          console.warn("Active audio segment failed playing on sync:", err);
        });
      }
    }
  }, [isPlaying]);

  // Unified voice toggler
  const toggleReciterVoice = () => {
    setIsPlaying(!isPlaying);
  };

  // Master High-Resolution Sync frame-by-frame loop
  const lastFrameTimeRef = useRef<number>(performance.now());
  
  useEffect(() => {
    let animationFrameId: number;
    lastFrameTimeRef.current = performance.now();
    
    const tick = () => {
      const now = performance.now();
      const delta = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;
      
      if (isPlaying) {
        const verses = selectedVersesRef.current;
        const totalDuration = verses.reduce((sum, v) => sum + v.duration, 0);
        const currentTime = reciterAudioTimeRef.current;
        
        // Find active idx inside loop dynamically
        const findIndex = (t: number) => {
          if (verses.length === 0) return 0;
          let accum = 0;
          for (let i = 0; i < verses.length; i++) {
            if (t >= accum && t < accum + verses[i].duration) {
              return i;
            }
            accum += verses[i].duration;
          }
          return verses.length - 1;
        };
        
        const activeIdx = findIndex(currentTime);
        const activeAudio = audiosRef.current[activeIdx];
        
        if (activeAudio && !activeAudio.paused && !activeAudio.ended) {
          // Audio is playing - sync perfectly
          let accumBefore = 0;
          for (let i = 0; i < activeIdx; i++) {
            accumBefore += verses[i]?.duration || 0;
          }
          const newTime = accumBefore + activeAudio.currentTime;
          
          if (Math.abs(newTime - currentTime) > 0.001) {
            reciterAudioTimeRef.current = newTime;
            setReciterAudioTime(newTime);
          }
        } else {
          // Audio is not active (buffer delay, preview only etc.) - advance smoothly at 60 FPS
          const newTime = currentTime + delta;
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            reciterAudioTimeRef.current = 0;
            setReciterAudioTime(0);
            
            audiosRef.current.forEach((a) => {
              try {
                a.pause();
                a.currentTime = 0;
              } catch (_) {}
            });
          } else {
            reciterAudioTimeRef.current = newTime;
            setReciterAudioTime(newTime);
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(tick);
    };
    
    animationFrameId = requestAnimationFrame(tick);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  // Call Gemini API on server to auto-generate beautiful style recommendation
  const handleTriggerAiGeneration = async () => {
    if (selectedVerses.length === 0) return;
    setIsAiLoading(true);
    setAiSuccessMessage("");
    try {
      const combinedArabic = selectedVerses.map(v => v.verse.text).join(" ۞ ");
      const combinedTranslation = selectedVerses.map(v => v.verse.translation).join(" ");
      const primaryVerse = selectedVerses[0].verse;

      const response = await fetch("/api/quran/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surahNumber: primaryVerse.surahNumber,
          ayahNumber: primaryVerse.numberInSurah,
          text: combinedArabic,
          translation: combinedTranslation,
          surahName: primaryVerse.surahName,
        }),
      });
      const data = await response.json();

      if (data.success && data.style) {
        const recommend = data.style;
        setSettings((prev) => ({
          ...prev,
          textColor: recommend.textColor || "#FFFFFF",
          textShadowColor: recommend.textShadowColor || "rgba(0,0,0,0.85)",
          textShadowBlur: recommend.textShadowBlur || 10,
          textGlowColor: recommend.textGlowColor || "",
          textGlowBlur: recommend.textGlowBlur || 4,
          videoOpacity: recommend.videoOpacity || 85,
          videoBrightness: recommend.videoBrightness || 32,
          textPosition: recommend.textPosition || 50,
          fontName: recommend.fontName || "Amiri",
          showTranslation: recommend.showTranslation !== undefined ? recommend.showTranslation : true
        }));

        setAestheticTitle(recommend.aestheticTitle || "Divine Wisdom");
        setReflectionPrompt(recommend.reflectionPrompt || "");
        
        if (recommend.bgVideoId) {
          const matchingVideo = BACKGROUND_VIDEOS.find(v => v.id === recommend.bgVideoId);
          if (matchingVideo) {
            setSelectedVideo(matchingVideo);
            setUploadedVideoUrl(null);
          }
        }
        
        setIsPlaying(true);
        setAiSuccessMessage(data.aiRecommended 
          ? "✨ Gemini AI successfully customized layouts matching theological tones!" 
          : "☘️ RuleHeuristic design applied successfully (Dev fallback)."
        );

        setTimeout(() => setAiSuccessMessage(""), 5000);
      } else {
        throw new Error(data.error || "Fail to fetch");
      }
    } catch (err: any) {
      console.error("AI recommendation failed:", err);
      setAiSuccessMessage("⚠️ Connection to design server was slow. Try again!");
    } finally {
      setIsAiLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#050505] font-sans text-zinc-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Visual background ambient blobs */}
      <div className="absolute top-0 left-0 w-[40vw] h-[40vw] bg-emerald-950/15 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[45vw] h-[45vw] bg-teal-950/10 rounded-full filter blur-[140px] pointer-events-none" />

      {/* Main Studio Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/15">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>
          </div>
          <div>
            <h1 className="text-white font-extrabold text-lg tracking-tight font-sans">QURAN<span className="text-emerald-500">SHORTS</span></h1>
            <p className="text-zinc-500 text-[10px] tracking-widest font-bold">9:16 VERTICAL CREATOR</p>
          </div>
        </div>

        {/* Global HUD elements */}
        <div className="flex items-center space-x-4">
          <span className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Pro Plan Active
          </span>
          <div className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-emerald-400">
            <Moon className="w-4 h-4 fill-emerald-400" />
          </div>
        </div>
      </header>

      {/* Main Studio Layout workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10 overflow-hidden">
        
        {/* LEFT COLUMN: 9:16 Preview screen mockup - takes 5 cols */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center h-full">
          {/* Main system-wide toasts alert banners */}
          {aiSuccessMessage && (
            <div className="w-full max-w-[340px] mb-3 p-3 rounded-2xl text-[11px] font-semibold leading-relaxed bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 shrink-0 fill-emerald-400 text-emerald-400" />
              <span>{aiSuccessMessage}</span>
            </div>
          )}

          <VideoPlayer
            verse={currentVerse}
            selectedVerses={selectedVerses}
            settings={settings}
            setSettings={setSettings}
            selectedVideo={selectedVideo}
            uploadedVideoUrl={uploadedVideoUrl}
            uploadedImageUrl={uploadedImageUrl}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            selectedReciterName={selectedReciter.name}
            isAiLoading={isAiLoading}
            aestheticTitle={aestheticTitle}
            reflectionPrompt={reflectionPrompt}
            reciterAudioTime={reciterAudioTime}
            reciterAudioDuration={reciterAudioDuration}
            isReciterPlaying={isReciterPlaying}
            toggleReciterVoice={toggleReciterVoice}
            reciterError={reciterError}
            activeWordTimings={activeWordTimings}
            customSegments={customSegments}
            onSeekAudio={handleSeekAudio}
          />
        </div>

        {/* RIGHT COLUMN: Editors panels and configurations tabs - takes 7 cols */}
        <div className="lg:col-span-7 flex flex-col h-[640px]">
          <ControlPanel
            currentVerse={currentVerse}
            setCurrentVerse={setCurrentVerse}
            selectedVerses={selectedVerses}
            setSelectedVerses={setSelectedVerses}
            isLoadingAudio={isLoadingAudio}
            setIsLoadingAudio={setIsLoadingAudio}
            settings={settings}
            setSettings={setSettings}
            selectedVideo={selectedVideo}
            setSelectedVideo={setSelectedVideo}
            uploadedVideoUrl={uploadedVideoUrl}
            setUploadedVideoUrl={setUploadedVideoUrl}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onTriggerAiGeneration={handleTriggerAiGeneration}
            isAiLoading={isAiLoading}
            selectedReciter={selectedReciter}
            setSelectedReciter={setSelectedReciter}
            setAestheticTitle={setAestheticTitle}
            setReflectionPrompt={setReflectionPrompt}
            aestheticTitle={aestheticTitle}
            reflectionPrompt={reflectionPrompt}
            reciterAudioTime={reciterAudioTime}
            reciterAudioDuration={reciterAudioDuration}
            isReciterPlaying={isReciterPlaying}
            toggleReciterVoice={toggleReciterVoice}
            reciterError={reciterError}
            activeWordTimings={activeWordTimings}
            customSegments={customSegments}
            historyIndex={historyIndex}
            historyLength={timingHistory.length}
            onUpdateWordTiming={handleUpdateWordTiming}
            onShiftSegmentTiming={handleShiftSegmentTiming}
            onUndoTiming={handleUndoTiming}
            onRedoTiming={handleRedoTiming}
            onResetToAutoTiming={handleResetToAutoTiming}
            onSeekAudio={handleSeekAudio}
          />
        </div>

      </main>

      {/* System Footer bar - Anti AI-slop layout details */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 mt-auto z-20">
        <span className="flex items-center gap-1 font-medium font-sans">
          Created with <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" /> for the global Ummah • 100% Client-Side Render Exporting
        </span>
        <span className="text-[10px] font-mono select-none text-slate-600 h-5">
          QURAN_SHORTS_ENGINE_v4.5_ACTIVE
        </span>
      </footer>
    </div>
  );
}
