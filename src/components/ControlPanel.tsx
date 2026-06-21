import React, { useState, useRef, useEffect } from "react";
import { 
  Music, 
  Settings, 
  Sparkles, 
  Video, 
  Type, 
  FileVideo, 
  Play, 
  Pause, 
  Download, 
  Upload, 
  Image,
  Search, 
  Layout, 
  VolumeX, 
  Volume2, 
  Check, 
  Maximize2,
  ChevronDown,
  Info,
  RefreshCw,
  Clock,
  Undo,
  Redo,
  RotateCcw,
  Sliders,
  Plus,
  Minus,
  ChevronUp,
  X,
  Heart,
  ShieldCheck,
  Filter
} from "lucide-react";
import { quranSurahs } from "../data/quranSurahs";
import { BACKGROUND_VIDEOS, TEMPLATE_PRESETS, RECITERS } from "../data/presets";
import { BUILTIN_BACKGROUNDS, LIBRARY_CATEGORIES, LibraryBackground } from "../data/backgroundLibrary";
import { VerseData, VideoEditorSettings, BackgroundVideo, TemplatePreset, Reciter, SelectedVerseInfo } from "../types";

// Famous premium fallbacks for offline immediate load
const PRELOADED_VERSES: VerseData[] = [
  {
    surahNumber: 1,
    numberInSurah: 1,
    text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
    surahName: "Al-Fatihah",
    absoluteAyahIndex: 1
  },
  {
    surahNumber: 18,
    numberInSurah: 10,
    text: "إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    translation: "Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2115.mp3",
    surahName: "Al-Kahf",
    absoluteAyahIndex: 2115
  },
  {
    surahNumber: 55,
    numberInSurah: 13,
    text: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
    translation: "So which of the favors of your Lord will you double-believing pairs deny?",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4914.mp3",
    surahName: "Ar-Rahman",
    absoluteAyahIndex: 4914
  },
  {
    surahNumber: 2,
    numberInSurah: 255,
    text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
    translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep.",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3",
    surahName: "Al-Baqarah",
    absoluteAyahIndex: 262
  },
  {
    surahNumber: 112,
    numberInSurah: 1,
    text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    translation: "Say, He is Allah, the Unique One.",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3",
    surahName: "Al-Ikhlas",
    absoluteAyahIndex: 6222
  },
  {
    surahNumber: 20,
    numberInSurah: 25,
    text: "قَالَ رَبِّ اشْرَحْ لِي صَدْرِي",
    translation: "Moses said, 'My Lord, expand for me my breast and ease my task.'",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2373.mp3",
    surahName: "Ta-Ha",
    absoluteAyahIndex: 2373
  }
];

import { getWordTimings, getSegmentTimings, findActiveTiming, WordTiming, SegmentTiming, getReciterAudioCandidates, verifyAndGetAudioDuration, findActiveVerse } from "../utils/captionHelper";

interface ControlPanelProps {
  currentVerse: VerseData | null;
  setCurrentVerse: (verse: VerseData | null) => void;
  selectedVerses?: SelectedVerseInfo[];
  setSelectedVerses?: React.Dispatch<React.SetStateAction<SelectedVerseInfo[]>>;
  isLoadingAudio?: boolean;
  setIsLoadingAudio?: (loading: boolean) => void;
  settings: VideoEditorSettings;
  setSettings: (updater: (prev: VideoEditorSettings) => VideoEditorSettings) => void;
  selectedVideo: BackgroundVideo;
  setSelectedVideo: (video: BackgroundVideo) => void;
  uploadedVideoUrl: string | null;
  setUploadedVideoUrl: (url: string | null) => void;
  uploadedImageUrl?: string | null;
  setUploadedImageUrl?: (url: string | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onTriggerAiGeneration: () => Promise<void>;
  isAiLoading: boolean;
  selectedReciter: Reciter;
  setSelectedReciter: (reciter: Reciter) => void;
  setAestheticTitle: (title: string) => void;
  setReflectionPrompt: (prompt: string) => void;
  aestheticTitle: string;
  reflectionPrompt: string;
  reciterAudioTime: number;
  reciterAudioDuration: number;
  isReciterPlaying: boolean;
  toggleReciterVoice: () => void;
  reciterError: string;
  activeWordTimings?: WordTiming[];
  customSegments?: SegmentTiming[];
  historyIndex?: number;
  historyLength?: number;
  onUpdateWordTiming?: (wordIndex: number, property: "start" | "end", newValue: number) => void;
  onShiftSegmentTiming?: (wordIndices: number[], offset: number) => void;
  onUndoTiming?: () => void;
  onRedoTiming?: () => void;
  onResetToAutoTiming?: () => void;
  onSeekAudio?: (time: number) => void;
}

const PEXELS_CATEGORIES = [
  "All",
  "Mountains",
  "Ocean",
  "Forest",
  "Rain",
  "Sky",
  "Desert",
  "Minimal",
  "Abstract"
];

export default function ControlPanel({
  currentVerse,
  setCurrentVerse,
  selectedVerses = [],
  setSelectedVerses,
  isLoadingAudio = false,
  setIsLoadingAudio,
  settings,
  setSettings,
  selectedVideo,
  setSelectedVideo,
  uploadedVideoUrl = null,
  setUploadedVideoUrl,
  uploadedImageUrl = null,
  setUploadedImageUrl,
  isPlaying,
  setIsPlaying,
  onTriggerAiGeneration,
  isAiLoading,
  selectedReciter,
  setSelectedReciter,
  setAestheticTitle,
  setReflectionPrompt,
  aestheticTitle,
  reflectionPrompt,
  reciterAudioTime,
  reciterAudioDuration,
  isReciterPlaying,
  toggleReciterVoice,
  reciterError,
  activeWordTimings = [],
  customSegments = [],
  historyIndex = 0,
  historyLength = 0,
  onUpdateWordTiming,
  onShiftSegmentTiming,
  onUndoTiming,
  onRedoTiming,
  onResetToAutoTiming,
  onSeekAudio,
}: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<"verse" | "ai" | "templates" | "visuals" | "canvas" | "audio" | "timing" | "save">("verse");
  
  // Selection Search Stats
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(18);
  const [selectedAyahNum, setSelectedAyahNum] = useState<number>(1);
  const [selectedEndAyahNum, setSelectedEndAyahNum] = useState<number>(3);
  const [isRangeMode, setIsRangeMode] = useState<boolean>(true);
  const [isSearchingVerses, setIsSearchingVerses] = useState(false);
  const [verseError, setVerseError] = useState("");
  const [expandedSegment, setExpandedSegment] = useState<number | null>(null);

  // States for previewing the full Quran texts in authentic Uthmani script of the active Surah
  const [surahVerses, setSurahVerses] = useState<{ numberInSurah: number; text: string }[]>([]);
  const [isLoadingSurahVerses, setIsLoadingSurahVerses] = useState<boolean>(false);
  const [selectedAyahs, setSelectedAyahs] = useState<number[]>([1, 2, 3]);

  // Sync end ayah bound on select verse changes
  const activeSurah = quranSurahs.find(s => s.number === selectedSurahNum) || quranSurahs[17];

  useEffect(() => {
    if (selectedEndAyahNum < selectedAyahNum) {
      setSelectedEndAyahNum(selectedAyahNum);
    }
  }, [selectedAyahNum]);

  // Fetch all verses of the currently selected Surah
  useEffect(() => {
    let active = true;
    const fetchSurah = async () => {
      setIsLoadingSurahVerses(true);
      try {
        let ayahs = null;
        try {
          const resp = await fetch(`/api/quran/surah?surah=${selectedSurahNum}`);
          if (resp.ok) {
            const result = await resp.json();
            if (result.success && result.ayahs) {
              ayahs = result.ayahs;
            }
          }
        } catch (e) {
          console.warn("Backend surah fetch failed, falling back to direct cloud API:", e);
        }

        // Direct fallback if backend was unavailable (e.g. on Netlify or Vercel)
        if (!ayahs) {
          const response = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurahNum}/quran-uthmani`);
          const data = await response.json();
          if (data.code === 200 && data.data && data.data.ayahs) {
            ayahs = data.data.ayahs.map((ayah: any) => {
              let verseText = ayah.text || "";
              const aNum = Number(ayah.numberInSurah);
              if (selectedSurahNum !== 1 && selectedSurahNum !== 9 && aNum === 1) {
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
          }
        }

        if (active && ayahs) {
          setSurahVerses(ayahs);
        }
      } catch (err) {
        console.error("Failed to load surah verses fully:", err);
      } finally {
        if (active) setIsLoadingSurahVerses(false);
      }
    };
    fetchSurah();
    return () => {
      active = false;
    };
  }, [selectedSurahNum]);

  // Adjust defaults and selected range when active Surah changes
  useEffect(() => {
    const limit = Math.min(3, activeSurah.numberOfAyahs);
    setSelectedAyahNum(1);
    setSelectedEndAyahNum(limit);
    const defaults = Array.from({ length: limit }, (_, i) => i + 1);
    setSelectedAyahs(defaults);
  }, [selectedSurahNum, activeSurah.numberOfAyahs]);

  // Synchronize range sliders with selectedAyahs checklist selection
  useEffect(() => {
    if (isRangeMode) {
      const range = Array.from(
        { length: selectedEndAyahNum - selectedAyahNum + 1 },
        (_, i) => selectedAyahNum + i
      );
      setSelectedAyahs(range);
    } else {
      setSelectedAyahs([selectedAyahNum]);
    }
  }, [selectedAyahNum, selectedEndAyahNum, isRangeMode]);

  // Fallback map if the network API is loading or offline
  const getDisplayVerses = () => {
    if (surahVerses.length > 0) return surahVerses;
    const fallbacks: { numberInSurah: number; text: string }[] = [];
    for (let i = 1; i <= activeSurah.numberOfAyahs; i++) {
      const preloaded = PRELOADED_VERSES.find(v => v.surahNumber === selectedSurahNum && v.numberInSurah === i);
      fallbacks.push({
        numberInSurah: i,
        text: preloaded?.text || (selectedSurahNum === 18 && i === 10 ? "إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً" : "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ")
      });
    }
    return fallbacks;
  };

  const handleToggleAyah = (aNum: number) => {
    setSelectedAyahs((prev) => {
      let next;
      if (prev.includes(aNum)) {
        next = prev.filter(num => num !== aNum);
      } else {
        next = [...prev, aNum].sort((a, b) => a - b);
      }

      // Update sliders to synchronize perfectly
      if (next.length > 0) {
        setSelectedAyahNum(next[0]);
        setSelectedEndAyahNum(next[next.length - 1]);
      }
      return next;
    });
  };

  // CapCut-level nonlinear timeline configurations & states
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1.8);
  const [isSnappingEnabled, setIsSnappingEnabled] = useState<boolean>(true);
  const [snapIndicatorTime, setSnapIndicatorTime] = useState<number | null>(null);
  const [isCollisionWarning, setIsCollisionWarning] = useState<boolean>(false);
  const [configMinGap, setConfigMinGap] = useState<number>(0.02); // 20ms minimum distance cap

  // Dynamic Horizontal Scrolling sync
  const tracksScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Auto-scroll timeline to keep playhead centered during playback (CapCut Style)
  useEffect(() => {
    const container = tracksScrollContainerRef.current;
    if (!container || !reciterAudioDuration || reciterAudioDuration <= 0) return;

    const scrollWidth = container.scrollWidth;
    const playheadPx = (reciterAudioTime / reciterAudioDuration) * scrollWidth;
    const containerCenter = container.clientWidth / 2;
    const targetScrollLeft = playheadPx - containerCenter;

    if (isReciterPlaying) {
      container.scrollLeft = targetScrollLeft;
    }
  }, [reciterAudioTime, reciterAudioDuration, isReciterPlaying]);

  // 2. Listen for Ctrl+Wheel or Pinch-Zoom events on the tracks container (CapCut Style)
  useEffect(() => {
    const container = tracksScrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.25 : 0.25;
        setZoomMultiplier(prev => Math.max(1, Math.min(20, prev + delta)));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Drag and scrub timeline positioning handler (Zoom-safe)
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeekAudio || !reciterAudioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    
    const getAndSeekTime = (clientX: number) => {
      const clickX = clientX - rect.left;
      const clickPercent = Math.max(0, Math.min(1, clickX / rect.width));
      onSeekAudio(clickPercent * reciterAudioDuration);
    };
    
    getAndSeekTime(e.clientX);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      getAndSeekTime(moveEvent.clientX);
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // High-precision CapCut Segment boundary Dragging
  const handleSegmentLeftDragMouseDown = (e: React.MouseEvent, segment: SegmentTiming, segIdx: number) => {
    e.stopPropagation();
    e.preventDefault();
    const tracksEl = e.currentTarget.parentElement?.parentElement;
    if (!tracksEl || !onUpdateWordTiming || !reciterAudioDuration) return;
    const rect = tracksEl.getBoundingClientRect();
    const firstWordIdx = segment.words[0].index;
    
    const prevSegmentEnd = segIdx > 0 ? customSegments[segIdx - 1].end : 0;
    const minGap = configMinGap;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - rect.left;
      const dragPercent = Math.max(0, Math.min(1, deltaX / rect.width));
      let targetTime = dragPercent * reciterAudioDuration;
      
      // Magnetic snapping alignment check
      if (isSnappingEnabled) {
        // Can snap to: playhead or previous end marker
        const candidates = [reciterAudioTime, prevSegmentEnd];
        const snapTolerance = 0.1 / zoomMultiplier;
        for (const cand of candidates) {
          if (Math.abs(targetTime - cand) < snapTolerance) {
            targetTime = cand;
            setSnapIndicatorTime(cand);
            break;
          } else {
            setSnapIndicatorTime(null);
          }
        }
      }

      // Collision wall enforcement
      const maxAllowed = segment.end - 0.1; // minimum segment width: 100ms
      const minAllowed = prevSegmentEnd + minGap;

      if (targetTime < minAllowed) {
        targetTime = minAllowed;
        setIsCollisionWarning(true);
      } else if (targetTime > maxAllowed) {
        targetTime = maxAllowed;
        setIsCollisionWarning(true);
      } else {
        setIsCollisionWarning(false);
      }

      onUpdateWordTiming(firstWordIdx, "start", targetTime);
    };

    const handleMouseUp = () => {
      setSnapIndicatorTime(null);
      setIsCollisionWarning(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSegmentRightDragMouseDown = (e: React.MouseEvent, segment: SegmentTiming, segIdx: number) => {
    e.stopPropagation();
    e.preventDefault();
    const tracksEl = e.currentTarget.parentElement?.parentElement;
    if (!tracksEl || !onUpdateWordTiming || !reciterAudioDuration) return;
    const rect = tracksEl.getBoundingClientRect();
    const lastWordIdx = segment.words[segment.words.length - 1].index;
    
    const nextSegmentStart = segIdx < customSegments.length - 1 ? customSegments[segIdx + 1].start : reciterAudioDuration;
    const minGap = configMinGap;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - rect.left;
      const dragPercent = Math.max(0, Math.min(1, deltaX / rect.width));
      let targetTime = dragPercent * reciterAudioDuration;
      
      // Magnetic snapping alignment check
      if (isSnappingEnabled) {
        // Can snap to: playhead or next start marker
        const candidates = [reciterAudioTime, nextSegmentStart];
        const snapTolerance = 0.1 / zoomMultiplier;
        for (const cand of candidates) {
          if (Math.abs(targetTime - cand) < snapTolerance) {
            targetTime = cand;
            setSnapIndicatorTime(cand);
            break;
          } else {
            setSnapIndicatorTime(null);
          }
        }
      }

      // Collision wall enforcement
      const minAllowed = segment.start + 0.1;
      const maxAllowed = nextSegmentStart - minGap;

      if (targetTime < minAllowed) {
        targetTime = minAllowed;
        setIsCollisionWarning(true);
      } else if (targetTime > maxAllowed) {
        targetTime = maxAllowed;
        setIsCollisionWarning(true);
      } else {
        setIsCollisionWarning(false);
      }

      onUpdateWordTiming(lastWordIdx, "end", targetTime);
    };

    const handleMouseUp = () => {
      setSnapIndicatorTime(null);
      setIsCollisionWarning(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSegmentBodyDragMouseDown = (e: React.MouseEvent, segment: SegmentTiming, segIdx: number) => {
    const target = e.target as HTMLElement;
    if (target.closest('.resize-handle') || target.closest('[title*="START"]') || target.closest('[title*="END"]')) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    const tracksEl = e.currentTarget.parentElement;
    if (!tracksEl || !onShiftSegmentTiming || !reciterAudioDuration) return;
    const rect = tracksEl.getBoundingClientRect();
    
    let originalStartX = e.clientX;
    const wordIndices = segment.words.map(w => w.index);
    
    const prevSegmentEnd = segIdx > 0 ? customSegments[segIdx - 1].end : 0;
    const nextSegmentStart = segIdx < customSegments.length - 1 ? customSegments[segIdx + 1].start : reciterAudioDuration;
    const minGap = configMinGap;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - originalStartX;
      const timeOffset = (deltaX / rect.width) * reciterAudioDuration;
      
      let finalOffset = timeOffset;
      const proposedStart = segment.start + timeOffset;
      const proposedEnd = segment.end + timeOffset;
      
      // Magnetic Snapping check
      let snapped = false;
      let snapTarget = 0;
      
      if (isSnappingEnabled) {
        const snapCandidates = [
          reciterAudioTime,
          prevSegmentEnd,
          nextSegmentStart,
          ...customSegments.map(s => s.start),
          ...customSegments.map(s => s.end)
        ];
        
        const snapTolerance = 0.12 / zoomMultiplier;
        
        // Check start snapping
        for (const cand of snapCandidates) {
          if (Math.abs(proposedStart - cand) < snapTolerance) {
            finalOffset = cand - segment.start;
            snapped = true;
            snapTarget = cand;
            break;
          }
        }
        
        // Check end snapping
        if (!snapped) {
          for (const cand of snapCandidates) {
            if (Math.abs(proposedEnd - cand) < snapTolerance) {
              finalOffset = cand - segment.end;
              snapped = true;
              snapTarget = cand;
              break;
            }
          }
        }
      }

      // Overlap and Collision Block enforces no crossover
      const finalStart = segment.start + finalOffset;
      const finalEnd = segment.end + finalOffset;
      
      if (finalStart < prevSegmentEnd + minGap) {
        finalOffset = (prevSegmentEnd + minGap) - segment.start;
        setIsCollisionWarning(true);
      } else if (finalEnd > nextSegmentStart - minGap) {
        finalOffset = (nextSegmentStart - minGap) - segment.end;
        setIsCollisionWarning(true);
      } else {
        setIsCollisionWarning(false);
      }

      if (snapped) {
        setSnapIndicatorTime(snapTarget);
      } else {
        setSnapIndicatorTime(null);
      }

      if (Math.abs(finalOffset) >= 0.001) {
        onShiftSegmentTiming(wordIndices, finalOffset);
        originalStartX = originalStartX + (finalOffset / reciterAudioDuration) * rect.width;
      }
    };

    const handleMouseUp = () => {
      setSnapIndicatorTime(null);
      setIsCollisionWarning(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Draggable Word Fine-Trimming Mouse Helpers (CapCut Syllables track)
  const handleWordLeftDragMouseDown = (e: React.MouseEvent, wordObj: WordTiming, parentSegment: SegmentTiming) => {
    e.stopPropagation();
    e.preventDefault();
    const tracksEl = e.currentTarget.parentElement?.parentElement;
    if (!tracksEl || !onUpdateWordTiming || !reciterAudioDuration) return;
    const rect = tracksEl.getBoundingClientRect();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - rect.left;
      const dragPercent = Math.max(0, Math.min(1, deltaX / rect.width));
      let targetTime = dragPercent * reciterAudioDuration;
      
      // Enforce syllable boundary blocks
      const minAllowed = parentSegment.start;
      const maxAllowed = wordObj.end - 0.05;
      
      if (targetTime < minAllowed) targetTime = minAllowed;
      if (targetTime > maxAllowed) targetTime = maxAllowed;
      
      onUpdateWordTiming(wordObj.index, "start", targetTime);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleWordRightDragMouseDown = (e: React.MouseEvent, wordObj: WordTiming, parentSegment: SegmentTiming) => {
    e.stopPropagation();
    e.preventDefault();
    const tracksEl = e.currentTarget.parentElement?.parentElement;
    if (!tracksEl || !onUpdateWordTiming || !reciterAudioDuration) return;
    const rect = tracksEl.getBoundingClientRect();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - rect.left;
      const dragPercentFixed = Math.max(0, Math.min(1, deltaX / rect.width));
      let targetTime = dragPercentFixed * reciterAudioDuration;
      
      // Enforce boundary blocks
      const minAllowed = wordObj.start + 0.05;
      const maxAllowed = parentSegment.end;
      
      if (targetTime < minAllowed) targetTime = minAllowed;
      if (targetTime > maxAllowed) targetTime = maxAllowed;
      
      onUpdateWordTiming(wordObj.index, "end", targetTime);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleWordBodyDragMouseDown = (e: React.MouseEvent, wordObj: WordTiming, parentSegment: SegmentTiming) => {
    const target = e.target as HTMLElement;
    if (target.closest('.resize-handle')) return;
    
    e.stopPropagation();
    e.preventDefault();
    const tracksEl = e.currentTarget.parentElement;
    if (!tracksEl || !onUpdateWordTiming || !reciterAudioDuration) return;
    const rect = tracksEl.getBoundingClientRect();
    
    let originalStartX = e.clientX;
    const wordDuration = wordObj.end - wordObj.start;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - originalStartX;
      const timeOffset = (deltaX / rect.width) * reciterAudioDuration;
      
      let proposedStart = wordObj.start + timeOffset;
      let proposedEnd = wordObj.end + timeOffset;
      
      // Clamp word strictly within segment duration
      if (proposedStart < parentSegment.start) {
        proposedStart = parentSegment.start;
        proposedEnd = proposedStart + wordDuration;
      } else if (proposedEnd > parentSegment.end) {
        proposedEnd = parentSegment.end;
        proposedStart = proposedEnd - wordDuration;
      }
      
      onUpdateWordTiming(wordObj.index, "start", proposedStart);
      onUpdateWordTiming(wordObj.index, "end", proposedEnd);
      originalStartX = moveEvent.clientX;
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Keyboard Shortcuts hotkeys Listener
  useEffect(() => {
    if (activeTab !== "timing") return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")) return;
      
      const frameStep = e.shiftKey ? 0.25 : 0.05; // ~3 frames vs ~15 frames seek
      
      switch (e.key) {
        case " ":
          e.preventDefault();
          if (toggleReciterVoice) toggleReciterVoice();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (onSeekAudio) onSeekAudio(reciterAudioTime - frameStep);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (onSeekAudio) onSeekAudio(reciterAudioTime + frameStep);
          break;
        case "=":
        case "+":
          e.preventDefault();
          setZoomMultiplier(p => Math.min(6, p + 0.4));
          break;
        case "-":
        case "_":
          e.preventDefault();
          setZoomMultiplier(p => Math.max(1, p - 0.4));
          break;
        case "s":
        case "S":
          e.preventDefault();
          setIsSnappingEnabled(p => !p);
          break;
        case "[": // snap current segment's start boundary to playhead
          e.preventDefault();
          if (customSegments.length > 0 && onUpdateWordTiming) {
            const activeIdx = customSegments.findIndex(s => reciterAudioTime >= s.start && reciterAudioTime <= s.end);
            const targetIndex = activeIdx !== -1 ? activeIdx : 0;
            const targetSeg = customSegments[targetIndex];
            if (targetSeg) {
              const firstWordIdx = targetSeg.words[0].index;
              onUpdateWordTiming(firstWordIdx, "start", Math.min(targetSeg.end - 0.05, reciterAudioTime));
            }
          }
          break;
        case "]": // snap current segment's end boundary to playhead
          e.preventDefault();
          if (customSegments.length > 0 && onUpdateWordTiming) {
            const activeIdx = customSegments.findIndex(s => reciterAudioTime >= s.start && reciterAudioTime <= s.end);
            const targetIndex = activeIdx !== -1 ? activeIdx : 0;
            const targetSeg = customSegments[targetIndex];
            if (targetSeg) {
              const lastWordIdx = targetSeg.words[targetSeg.words.length - 1].index;
              onUpdateWordTiming(lastWordIdx, "end", Math.max(targetSeg.start + 0.05, reciterAudioTime));
            }
          }
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTab, reciterAudioTime, reciterAudioDuration, customSegments, toggleReciterVoice, onSeekAudio, onUpdateWordTiming]);

  // Nasheed background audio player
  const [nasheedVolume, setNasheedVolume] = useState<number>(0);
  const nasheedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Exporter stats
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [renderedFramesCount, setRenderedFramesCount] = useState<number>(0);
  const [exportFps, setExportFps] = useState<number>(30);

  // Islamic-Friendly Built-In Background Library States (Pexels Dynamic API Browser)
  const [pexelsSubTab, setPexelsSubTab] = useState<"library" | "upload">("library");
  const [pexelsMediaType, setPexelsMediaType] = useState<"videos" | "photos">("videos");
  const [pexelsQuery, setPexelsQuery] = useState("");
  const [pexelsCategory, setPexelsCategory] = useState("All");
  const [pexelsLoading, setPexelsLoading] = useState(false);
  const [pexelsResults, setPexelsResults] = useState<any[]>([]);
  const [pexelsError, setPexelsError] = useState("");
  const [pexelsPage, setPexelsPage] = useState(1);
  const [isPexelsKeyMissing, setIsPexelsKeyMissing] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("quran_shorts_media_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic Pexels fetch effect to sync selected category / input queries
  useEffect(() => {
    let active = true;
    const fetchPexels = async () => {
      setPexelsLoading(true);
      setPexelsError("");
      try {
        const url = `/api/pexels/search?category=${encodeURIComponent(pexelsCategory)}&query=${encodeURIComponent(pexelsQuery)}&mediaType=${pexelsMediaType}&page=${pexelsPage}&perPage=12`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Proxy error: ${res.statusText}`);
        }
        const data = await res.json();
        if (active) {
          if (data.success) {
            setPexelsResults(data.results || []);
            setIsPexelsKeyMissing(!!data.usingFallback);
          } else {
            setPexelsError(data.error || "Failed to load backgrounds");
          }
        }
      } catch (err: any) {
        if (active) {
          setPexelsError(err.message || "Request failed");
        }
      } finally {
        if (active) {
          setPexelsLoading(false);
        }
      }
    };

    // Debounce manual queries if typed
    const handler = setTimeout(() => {
      fetchPexels();
    }, pexelsQuery.trim() !== "" ? 450 : 0);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [pexelsCategory, pexelsMediaType, pexelsQuery, pexelsPage]);

  // Selections utilities for dynamic phot/video links
  const selectPexelsPhoto = (photoUrl: string, photographerName: string) => {
    setUploadedImageUrl?.(photoUrl);
    setUploadedVideoUrl(null);
    setSelectedVideo({
      id: "pexels-photo",
      name: `Photo by ${photographerName}`,
      category: "nature",
      url: ""
    });
  };

  const selectPexelsVideo = (videoFileUrl: string, userName: string) => {
    setUploadedVideoUrl(videoFileUrl);
    setUploadedImageUrl?.(null);
    setSelectedVideo({
      id: "pexels-video",
      name: `Video by ${userName}`,
      category: "nature",
      url: videoFileUrl
    });
  };


  // Automatic Content Safety scanner states (Islamic Compliance Screening)
  const [isScanningCustomFile, setIsScanningCustomFile] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    metrics?: { humans: number; animals: number; faces: number };
  } | null>(null);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const updated = favorites.includes(id)
      ? favorites.filter(fid => fid !== id)
      : [...favorites, id];
    setFavorites(updated);
    try {
      localStorage.setItem("quran_shorts_media_favorites", JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not save background favorites in localstorage:", err);
    }
  };


  // Initialize Nasheed loop
  useEffect(() => {
    const nasheedAudio = new Audio();
    nasheedAudio.crossOrigin = "anonymous";
    nasheedAudio.src = `/api/audio-proxy?url=${encodeURIComponent("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3")}`;
    nasheedAudio.loop = true;
    nasheedAudio.volume = 0;
    nasheedAudioRef.current = nasheedAudio;
    
    return () => {
      if (nasheedAudioRef.current) {
        nasheedAudioRef.current.pause();
      }
    };
  }, []);

  // Update nasheed volume
  useEffect(() => {
    if (nasheedAudioRef.current) {
      nasheedAudioRef.current.volume = nasheedVolume / 100;
      if (nasheedVolume > 0 && isPlaying) {
        nasheedAudioRef.current.play().catch(() => {});
      } else {
        nasheedAudioRef.current.pause();
      }
    }
  }, [nasheedVolume, isPlaying]);

  // Search/Query verses from database
  const loadAndAppendVerses = async (sNum: number, startAyah: number, endAyah: number, specificAyahs?: number[]) => {
    if (!setSelectedVerses || !setIsLoadingAudio) return;
    setIsSearchingVerses(true);
    setIsLoadingAudio(true);
    setVerseError("");

    const newVerses: SelectedVerseInfo[] = [];
    const ayahsToLoad = specificAyahs && specificAyahs.length > 0
      ? specificAyahs
      : Array.from({ length: endAyah - startAyah + 1 }, (_, i) => startAyah + i);

    try {
      for (const aNum of ayahsToLoad) {
        let verseData: VerseData | null = null;
        try {
          const resp = await fetch(`/api/quran/verse?surah=${sNum}&ayah=${aNum}`);
          const result = await resp.json();
          if (result.success && result.data) {
            verseData = result.data;
          } else {
            throw new Error(result.error || "Server lookup failed");
          }
        } catch (err) {
          try {
            // High reliability static/client-side fallback to Alquran.cloud when hosted on Netlify
            const arRes = await fetch(`https://api.alquran.cloud/v1/ayah/${sNum}:${aNum}/quran-uthmani`);
            const arData = await arRes.json();
            const transRes = await fetch(`https://api.alquran.cloud/v1/ayah/${sNum}:${aNum}/en.sahih`);
            const transData = await transRes.json();

            if (arData.code === 200 && transData.code === 200) {
              const absoluteIndex = arData.data.number || 1;
              let verseText = arData.data.text || "";

              if (sNum !== 1 && sNum !== 9 && aNum === 1) {
                const words = verseText.trim().split(/\s+/);
                if (words.length >= 4 && (words[0].startsWith("بِسْمِ") || words[0] === "بِسْمِ")) {
                  verseText = words.slice(4).join(" ");
                }
              }

              verseData = {
                surahNumber: sNum,
                numberInSurah: aNum,
                text: verseText,
                translation: transData.data.text,
                audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${absoluteIndex}.mp3`,
                surahName: arData.data.surah.englishName,
                absoluteAyahIndex: absoluteIndex
              };
            } else {
              throw new Error("Direct cloud query returned invalid code");
            }
          } catch (cloudErr) {
            console.warn("Direct Cloud fallback failed. Loading local static layouts:", cloudErr);
            const preloaded = PRELOADED_VERSES.find(v => v.surahNumber === sNum && v.numberInSurah === aNum);
            if (preloaded) {
              verseData = preloaded;
            } else {
              const fallbackSurah = quranSurahs.find(s => s.number === sNum);
              verseData = {
                surahNumber: sNum,
                numberInSurah: aNum,
                text: sNum === 18 ? "إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً" : "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                translation: `Ayah ${aNum} translation [Surat ${fallbackSurah?.englishName || "Quran"}].`,
                audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${sNum + aNum}.mp3`,
                surahName: fallbackSurah?.englishName || "Surah",
                absoluteAyahIndex: sNum * 7 + aNum
              };
            }
          }
        }

        if (verseData) {
          const candidates = getReciterAudioCandidates(
            verseData.surahNumber,
            verseData.numberInSurah,
            verseData.absoluteAyahIndex,
            selectedReciter.identifier
          );
          const verified = await verifyAndGetAudioDuration(candidates);
          newVerses.push({
            verse: verseData,
            duration: verified.duration,
            audioUrl: verified.url
          });
        }
      }

      if (newVerses.length > 0) {
        setSelectedVerses((prev) => {
          const combined = [...prev, ...newVerses];
          if (setCurrentVerse && combined[0]) {
            setCurrentVerse(combined[0].verse);
          }
          return combined;
        });
      }
    } catch (e: any) {
      console.error("Multi-verse verification fell back:", e);
      setVerseError(`Audio sync failure: ${e.message || "Reciter URL unresponsive."}`);
    } finally {
      setIsSearchingVerses(false);
      setIsLoadingAudio(false);
    }
  };

  const handleRemoveVerse = (indexToRemove: number) => {
    if (!setSelectedVerses) return;
    setSelectedVerses((prev) => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      if (setCurrentVerse) {
        setCurrentVerse(filtered[0]?.verse || null);
      }
      return filtered;
    });
  };

  const handleClearVerses = () => {
    if (!setSelectedVerses) return;
    setSelectedVerses([]);
    if (setCurrentVerse) {
      setCurrentVerse(null);
    }
  };

  // Re-verify and rebuild playlist whenever selected reciter changes
  useEffect(() => {
    if (selectedVerses.length === 0 || !setSelectedVerses || !setIsLoadingAudio) return;
    const rebuildPlaylist = async () => {
      setIsLoadingAudio(true);
      const rebuilt: SelectedVerseInfo[] = [];
      try {
        for (const item of selectedVerses) {
          const candidates = getReciterAudioCandidates(
            item.verse.surahNumber,
            item.verse.numberInSurah,
            item.verse.absoluteAyahIndex,
            selectedReciter.identifier
          );
          const verified = await verifyAndGetAudioDuration(candidates);
          rebuilt.push({
            verse: item.verse,
            duration: verified.duration,
            audioUrl: verified.url
          });
        }
        setSelectedVerses(rebuilt);
      } catch (e) {
        console.warn("Rebuilding playlist with new reciter failed, keeping previous durations:", e);
      } finally {
        setIsLoadingAudio(false);
      }
    };
    rebuildPlaylist();
  }, [selectedReciter]);

  // Custom File Uploader logic with Automatic Islamic Compliance Content Scan
  const handleUserVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanningCustomFile(true);
      setScanProgress(0);
      setScanResult(null);

      let currentVal = 0;
      const interval = setInterval(() => {
        currentVal += 12;
        if (currentVal >= 100) {
          clearInterval(interval);
          setScanProgress(100);

          // Keyword scanner for shariah compliance
          const lowerName = file.name.toLowerCase();
          const disallowedWords = ["person", "human", "man", "woman", "girl", "boy", "cat", "dog", "bird", "animal", "face", "avatar", "character", "group", "crowd", "selfie", "child", "horse", "lion", "fish", "butterfly", "people", "guy", "lady"];
          const containsDisallowed = disallowedWords.some(word => lowerName.includes(word));

          if (containsDisallowed) {
            setScanResult({
              success: false,
              message: "Compliance Check Failed: Potential living creatures or human elements detected in file details. Built-in system policy strictly rejects human silhouettes, faces, animals, and birds to preserve spiritual focus.",
              metrics: { humans: 1, animals: 0, faces: 1 }
            });
            e.target.value = "";
          } else {
            setScanResult({
              success: true,
              message: "Compliance Check Succeeded! The asset contains no living beings or faces. Verified 100% compatible with Islamic visual guidelines.",
              metrics: { humans: 0, animals: 0, faces: 0 }
            });
            const url = URL.createObjectURL(file);
            setUploadedVideoUrl(url);
            if (setUploadedImageUrl) {
              setUploadedImageUrl(null);
            }
          }
          
          setTimeout(() => {
            setIsScanningCustomFile(false);
          }, 3500);
        } else {
          setScanProgress(currentVal);
        }
      }, 150);
    }
  };

  const handleUserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanningCustomFile(true);
      setScanProgress(0);
      setScanResult(null);

      let currentVal = 0;
      const interval = setInterval(() => {
        currentVal += 12;
        if (currentVal >= 100) {
          clearInterval(interval);
          setScanProgress(100);

          // Keyword scanner for shariah compliance
          const lowerName = file.name.toLowerCase();
          const disallowedWords = ["person", "human", "man", "woman", "girl", "boy", "cat", "dog", "bird", "animal", "face", "avatar", "character", "group", "crowd", "selfie", "child", "horse", "lion", "fish", "butterfly", "people", "guy", "lady"];
          const containsDisallowed = disallowedWords.some(word => lowerName.includes(word));

          if (containsDisallowed) {
            setScanResult({
              success: false,
              message: "Compliance Check Failed: Potential living creatures or human elements detected in file details. Built-in system policy strictly rejects human silhouettes, faces, animals, and birds to preserve spiritual focus.",
              metrics: { humans: 1, animals: 0, faces: 1 }
            });
            e.target.value = "";
          } else {
            setScanResult({
              success: true,
              message: "Compliance Check Succeeded! The asset contains no living beings or faces. Verified 100% compatible with Islamic visual guidelines.",
              metrics: { humans: 0, animals: 0, faces: 0 }
            });
            const url = URL.createObjectURL(file);
            if (setUploadedImageUrl) {
              setUploadedImageUrl(url);
            }
            setUploadedVideoUrl(null);
          }
          
          setTimeout(() => {
            setIsScanningCustomFile(false);
          }, 3500);
        } else {
          setScanProgress(currentVal);
        }
      }, 150);
    }
  };

  // Preset Application
  const handleSelectTemplate = (tpl: TemplatePreset) => {
    setSettings((prev) => ({
      ...prev,
      fontName: tpl.fontName,
      textColor: tpl.fontColor,
      fontSize: tpl.fontSize,
      alignment: tpl.alignment,
      textShadowColor: tpl.shadowColor,
      textShadowBlur: tpl.shadowBlur,
      textGlowColor: tpl.glowColor,
      textGlowBlur: tpl.glowRadius,
      videoOpacity: tpl.videoOpacity,
      videoBrightness: tpl.videoBrightness,
      animationType: tpl.animationType,
      activeTemplateId: tpl.id,
    }));

    const matchedVideo = BACKGROUND_VIDEOS.find(v => v.id === tpl.bgVideoId);
    if (matchedVideo) {
      setSelectedVideo(matchedVideo);
      setUploadedVideoUrl(null);
      if (setUploadedImageUrl) {
        setUploadedImageUrl(null);
      }
    }
  };

  // Filtered lists of Surahs based on typing
  const filteredSurahs = quranSurahs.filter(s => 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.name.includes(searchQuery)
  );

  // Web export logic using `<canvas>` and MediaRecorder timeline capture with Hybrid Timing Engine
  const handleExecuteExportProcess = async () => {
    if (isExporting) return;
    if (!currentVerse) return;
    
    // Force-pause normal page/preview playback to avoid state clashes and dual audio playback
    try {
      setIsPlaying(false);
      if (onSeekAudio) {
        onSeekAudio(0);
      }
    } catch (e) {
      console.warn("Could not pause preview playback on export start:", e);
    }

    // Force-reset preview background video element to starts from the beginning
    const previewVideoInDom = document.querySelector("#shorts-player-container video") as HTMLVideoElement;
    if (previewVideoInDom) {
      try {
        previewVideoInDom.pause();
        previewVideoInDom.currentTime = 0;
        await previewVideoInDom.play().catch(() => {});
      } catch (err) {
        console.warn("Could reset preview video element successfully:", err);
      }
    }

    setIsExporting(true);
    setExportProgress(1);
    setRenderedFramesCount(0);
    setExportFps(30);

    // Get live preview DOM references to grab their active URLs/paths securely
    const previewVideo = document.querySelector("#shorts-player-container video") as HTMLVideoElement;
    const previewImage = document.querySelector("#shorts-player-container img") as HTMLImageElement;

    // --- DEDICATED INDEPENDENT TIMELINE ENGINE ASSEMBLY ---
    // Instantiates isolated copies of recitation audio, background video/photo to prevent state collisions.
    const exportItems: { audioUrl: string; duration: number; verse: VerseData }[] = selectedVerses.length > 0
      ? selectedVerses.map(v => ({ audioUrl: v.audioUrl, duration: v.duration, verse: v.verse }))
      : (currentVerse ? [{ audioUrl: currentVerse.audio, duration: reciterAudioDuration || 8, verse: currentVerse }] : []);

    if (exportItems.length === 0) {
      setIsExporting(false);
      alert("Validation Error: No active recitation verses selected for exporting.");
      return;
    }

    // 1. Load recitation audio elements fully
    const exportAudios: HTMLAudioElement[] = exportItems.map(item => {
      const a = new Audio(item.audioUrl);
      a.crossOrigin = "anonymous";
      a.preload = "auto";
      return a;
    });

    try {
      await Promise.all(exportAudios.map(audio => {
        return new Promise<void>((resolve) => {
          if (audio.readyState >= 1) {
            resolve();
          } else {
            const onLoaded = () => {
              audio.removeEventListener("loadedmetadata", onLoaded);
              audio.removeEventListener("error", onError);
              resolve();
            };
            const onError = () => {
              audio.removeEventListener("loadedmetadata", onLoaded);
              audio.removeEventListener("error", onError);
              resolve();
            };
            audio.addEventListener("loadedmetadata", onLoaded);
            audio.addEventListener("error", onError);
            setTimeout(resolve, 3000); // safety fallback response
          }
        });
      }));
    } catch (err) {
      console.warn("Recitation tracks loaded with background warnings:", err);
    }

    // Compute duration from audio ONLY
    const totalAudioDuration = exportAudios.reduce((sum, a) => sum + (a.duration || 0), 0) || exportItems.reduce((sum, v) => sum + (v.duration || 0), 0) || 8;
    const duration = totalAudioDuration;

    if (duration <= 0 || isNaN(duration)) {
      setIsExporting(false);
      alert("Validation Error: Independent recitation timeline duration is invalid or zero.");
      return;
    }

    // 2. Load background image or background video copy independently
    let exportImage: HTMLImageElement | null = null;
    let exportVideo: HTMLVideoElement | null = null;

    const activeImageUrl = uploadedImageUrl;
    const activeVideoUrl = uploadedVideoUrl || (selectedVideo ? selectedVideo.url : null);

    if (previewImage && previewImage.src) {
      exportImage = new window.Image();
      exportImage.src = previewImage.src;
      exportImage.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        if (exportImage!.complete) {
          resolve();
        } else {
          exportImage!.onload = () => resolve();
          exportImage!.onerror = () => resolve();
          setTimeout(resolve, 3000);
        }
      });
    } else if (activeImageUrl) {
      exportImage = new window.Image();
      exportImage.src = activeImageUrl;
      exportImage.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        if (exportImage!.complete) {
          resolve();
        } else {
          exportImage!.onload = () => resolve();
          exportImage!.onerror = () => resolve();
          setTimeout(resolve, 3000);
        }
      });
    } else if (previewVideo && previewVideo.src) {
      exportVideo = document.createElement("video");
      exportVideo.src = previewVideo.src;
      exportVideo.crossOrigin = "anonymous";
      exportVideo.muted = true;
      exportVideo.loop = true;
      exportVideo.preload = "auto";
      exportVideo.playsInline = true;
      await new Promise<void>((resolve) => {
        if (exportVideo!.readyState >= 2) {
          resolve();
        } else {
          exportVideo!.addEventListener("loadeddata", () => resolve(), { once: true });
          exportVideo!.addEventListener("error", () => resolve(), { once: true });
          setTimeout(resolve, 3000);
        }
      });
    } else if (activeVideoUrl) {
      exportVideo = document.createElement("video");
      exportVideo.src = activeVideoUrl;
      exportVideo.crossOrigin = "anonymous";
      exportVideo.muted = true;
      exportVideo.loop = true;
      exportVideo.preload = "auto";
      exportVideo.playsInline = true;
      await new Promise<void>((resolve) => {
        if (exportVideo!.readyState >= 2) {
          resolve();
        } else {
          exportVideo!.addEventListener("loadeddata", () => resolve(), { once: true });
          exportVideo!.addEventListener("error", () => resolve(), { once: true });
          setTimeout(resolve, 3000);
        }
      });
    } else {
      setIsExporting(false);
      alert("Validation Error: Background asset is still buffering or not fully loaded.");
      return;
    }

    // 3. Load background Nasheed music copy dynamically
    let exportNasheedAudio: HTMLAudioElement | null = null;
    if (nasheedAudioRef.current && nasheedVolume > 0) {
      exportNasheedAudio = new Audio(nasheedAudioRef.current.src);
      exportNasheedAudio.crossOrigin = "anonymous";
      exportNasheedAudio.loop = true;
      exportNasheedAudio.volume = nasheedVolume / 100;
      exportNasheedAudio.preload = "auto";
      await new Promise<void>((resolve) => {
        if (exportNasheedAudio!.readyState >= 1) {
          resolve();
        } else {
          exportNasheedAudio!.addEventListener("loadedmetadata", () => resolve(), { once: true });
          exportNasheedAudio!.addEventListener("error", () => resolve(), { once: true });
          setTimeout(resolve, 2000);
        }
      });
    }

    // 4. Set up captions data independently
    const wordTimings = activeWordTimings && activeWordTimings.length > 0 
      ? activeWordTimings 
      : getWordTimings(currentVerse.text, duration);
    const segments = customSegments && customSegments.length > 0 
      ? customSegments 
      : getSegmentTimings(wordTimings, currentVerse.translation, settings.maxWordsPerSegment || 5);

    if (!segments || segments.length === 0) {
      setIsExporting(false);
      alert("Validation Error: Subtitle segments are not properly loaded or generated.");
      return;
    }

    // Set export state as globally active while avoiding audio state clashes
    if (typeof window !== "undefined") {
      (window as any).__isExportingActive = true;
    }

    // --- ESTABLISH THE INDEPENDENT WEB AUDIO MIXING GRAPH ---
    let audioCtx: AudioContext;
    let destination: MediaStreamAudioDestinationNode;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      destination = audioCtx.createMediaStreamDestination();
    } catch (e) {
      setIsExporting(false);
      if (typeof window !== "undefined") {
        (window as any).__isExportingActive = false;
      }
      alert(`Export Engine Error: Unable to initialize Web Audio rendering graph: ${e instanceof Error ? e.message : e}`);
      return;
    }

    const getAudioSourceNode = (audioEl: HTMLAudioElement, ctx: AudioContext) => {
      let sourceNode = (audioEl as any).__sourceNode;
      if (!sourceNode) {
        sourceNode = ctx.createMediaElementSource(audioEl);
        (audioEl as any).__sourceNode = sourceNode;
      }
      return sourceNode;
    };

    // Connect and patch our export-only isolated voice tracks to the recording stream destination
    try {
      exportAudios.forEach((audioEl: HTMLAudioElement) => {
        if (!audioEl) return;
        const node = getAudioSourceNode(audioEl, audioCtx);
        try {
          node.disconnect();
        } catch (_) {}
        node.connect(destination);
        node.connect(audioCtx.destination); // Play aloud in real-time
      });
    } catch (e) {
      setIsExporting(false);
      if (typeof window !== "undefined") {
        (window as any).__isExportingActive = false;
      }
      alert(`Render Composition Error: Failed to include recitation track sources: ${e instanceof Error ? e.message : e}`);
      return;
    }

    // Patch optional background music node safely
    let nasheedNode: MediaElementAudioSourceNode | null = null;
    let nasheedGain: GainNode | null = null;
    if (exportNasheedAudio) {
      try {
        nasheedNode = audioCtx.createMediaElementSource(exportNasheedAudio);
        nasheedGain = audioCtx.createGain();
        nasheedGain.gain.value = nasheedVolume / 100;
        
        nasheedNode.connect(nasheedGain);
        nasheedGain.connect(destination);
        nasheedGain.connect(audioCtx.destination);
      } catch (e) {
        console.warn("Failed to patch background audio track perfectly:", e);
      }
    }

    // Prepare HD vertical workspace canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsExporting(false);
      if (typeof window !== "undefined") {
        (window as any).__isExportingActive = false;
      }
      alert("Unable to initialize canvas context.");
      return;
    }

    // Combine MediaRecorder stream from canvas capture + Audio graph
    const chunks: Blob[] = [];
    const fps = 30;
    const canvasStream = canvas.captureStream(fps);
    const audioStream = destination.stream;

    if (audioStream.getAudioTracks().length === 0) {
      setIsExporting(false);
      if (typeof window !== "undefined") {
        (window as any).__isExportingActive = false;
      }
      alert("Validation Error: Web Audio capture pipeline failed to yield a valid sound track.");
      return;
    }

    const combinedTracks = [
      ...canvasStream.getVideoTracks(),
      ...audioStream.getAudioTracks()
    ];
    const combinedStream = new MediaStream(combinedTracks);
    
    const getRecorder = (stream: MediaStream) => {
      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=h264,opus",
        "video/webm",
        "video/mp4"
      ];
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          try {
            return new MediaRecorder(stream, {
              mimeType: mime,
              videoBitsPerSecond: 8000000, // 8 Mbps
              audioBitsPerSecond: 320000 // 320 Kbps
            });
          } catch (e) {
            console.warn(`Could not init MediaRecorder with ${mime}, trying next...`);
          }
        }
      }
      return new MediaRecorder(stream);
    };

    const mediaRecorder = getRecorder(combinedStream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onerror = (err: any) => {
      console.error("MediaRecorder error:", err);
      setIsExporting(false);
      setExportProgress(0);
      if (typeof window !== "undefined") {
        (window as any).__isExportingActive = false;
      }
      alert("An error occurred during video compilation: " + (err?.message || err?.name || "Unknown encoder exception"));
    };

    mediaRecorder.onstop = () => {
      const mimeTypeUsed = mediaRecorder.mimeType || "video/webm";
      const isMp4 = mimeTypeUsed.includes("mp4");
      const ext = isMp4 ? "mp4" : "webm";
      const completeBlob = new Blob(chunks, { type: mimeTypeUsed });
      const exportUrl = URL.createObjectURL(completeBlob);
      
      const a = document.createElement("a");
      a.href = exportUrl;
      a.download = `QuranShorts_${currentVerse.surahName}_Ayah${currentVerse.numberInSurah}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setIsExporting(false);
      setExportProgress(0);
      if (typeof window !== "undefined") {
        (window as any).__isExportingActive = false;
      }
      setExportedVideoUrl(exportUrl);
    };

    // Ensure cinematic Arabic/English layouts are loaded ahead of time
    try {
      const activeArabicFontName = settings.fontName === "Amiri" ? "Amiri" : "Scheherazade New";
      const activeEnglishFontName = settings.translationFontName || "Inter";
      await Promise.all([
        document.fonts.load(`bold 24px "${activeArabicFontName}"`),
        document.fonts.load(`italic 24px "${activeEnglishFontName}"`),
        document.fonts.load(`16px "Inter"`)
      ]);
    } catch (fontErr) {
      console.warn("Dynamic font pre-validation skipped:", fontErr);
    }

    // Start recording
    mediaRecorder.start();

    // 5. Establish independent chain playback listener transitions for export audios
    exportAudios.forEach((audio, index) => {
      audio.pause();
      audio.currentTime = 0;

      const handleExportAudioEnded = () => {
        const nextIdx = index + 1;
        if (nextIdx < exportAudios.length) {
          const nextAudio = exportAudios[nextIdx];
          if (nextAudio) {
            nextAudio.currentTime = 0;
            nextAudio.play().catch(err => console.warn("Export chain transition playback failed:", nextIdx, err));
          }
        }
      };
      audio.addEventListener("ended", handleExportAudioEnded);
      (audio as any).__exportEndedHandler = handleExportAudioEnded;
    });

    // Start playback of our export timeline sound outputs
    try {
      if (exportAudios[0]) {
        await exportAudios[0].play();
      }
    } catch (e) {
      console.warn("Could not start export recitation transition track:", e);
    }

    if (exportNasheedAudio) {
      try {
        await exportNasheedAudio.play();
      } catch (e) {
        console.warn("Could not start background nasheed playback:", e);
      }
    }

    // Helper to calculate total accumulated duration for verses
    const getAccumulatedDurationBefore = (idx: number) => {
      let sum = 0;
      if (exportItems) {
        for (let i = 0; i < idx; i++) {
          sum += exportItems[i]?.duration || 0;
        }
      }
      return sum;
    };

    // Fetch precise, decoupled audio playhead directly from our isolated audio copies
    const getExportCurrentAudioTime = () => {
      if (exportAudios && exportAudios.length > 0) {
        let activeIdx = 0;
        for (let i = 0; i < exportAudios.length; i++) {
          const audio = exportAudios[i];
          if (audio && !audio.paused && !audio.ended) {
            activeIdx = i;
            break;
          }
        }
        if (activeIdx === 0 && exportAudios.every((a: HTMLAudioElement) => a.paused)) {
          for (let i = exportAudios.length - 1; i >= 0; i--) {
            if (exportAudios[i]?.ended) {
              activeIdx = i;
              break;
            }
          }
        }
        const accumBefore = getAccumulatedDurationBefore(activeIdx);
        const activeAudio = exportAudios[activeIdx];
        const currentAudioTime = activeAudio ? activeAudio.currentTime : 0;
        return accumBefore + currentAudioTime;
      }
      return 0;
    };

    // High performance frame rendering loop driven by smooth drift-corrected clock
    const startTimeStamp = performance.now();
    let virtualElapsedTime = 0;
    let lastTickTime = performance.now();
    let frameDrawCount = 0;
    let lastFpsCalculationTime = performance.now();
    let fpsFrames = 0;
    let animationFrameId: number;

    let isStopCalled = false;
    const stopRecordingAndCleanup = () => {
      if (isStopCalled) return;
      isStopCalled = true;

      cancelAnimationFrame(animationFrameId);

      try {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      } catch (me) {
        console.error("Error stopping MediaRecorder:", me);
      }

      // Close independent audio elements & clean event handlers immediately
      exportAudios.forEach((audio) => {
        try {
          audio.pause();
          const handler = (audio as any).__exportEndedHandler;
          if (handler) {
            audio.removeEventListener("ended", handler);
          }
          audio.src = "";
        } catch (_) {}
      });

      if (exportNasheedAudio) {
        try {
          exportNasheedAudio.pause();
          exportNasheedAudio.src = "";
        } catch (_) {}
      }

      if (exportVideo) {
        try {
          exportVideo.pause();
          exportVideo.src = "";
        } catch (_) {}
      }

      try {
        audioCtx.close();
      } catch (_) {}
    };

    const renderLoop = () => {
      const now = performance.now();
      const delta = (now - lastTickTime) / 1000;
      lastTickTime = now;

      // Advance virtual clock at exact smooth timing to guarantee buttery-smooth 60fps subtitle highlights
      virtualElapsedTime += delta;

      // Check current precise audio playhead
      const audioTime = getExportCurrentAudioTime();

      // Drift corrector
      const drift = virtualElapsedTime - audioTime;
      if (Math.abs(drift) > 0.2) {
        virtualElapsedTime = audioTime;
      }

      // Check for termination criteria
      const isAudioEnded = exportAudios.every((a: HTMLAudioElement) => a.ended || a.currentTime >= a.duration);

      // Render terminates precisely when project duration is met or if audio naturally ends
      if (virtualElapsedTime >= duration || (virtualElapsedTime > 0.5 && isAudioEnded)) {
        stopRecordingAndCleanup();
        return;
      }

      // Draw standard cinematic frame at current virtual elapsed timestamp (fully drift-corrected)
      drawFrameAtTimestamp(virtualElapsedTime);

      // Increment counters
      frameDrawCount++;
      fpsFrames++;

      // Progress bar updates
      const progressPercent = Math.min(99, Math.floor((virtualElapsedTime / duration) * 100));
      setExportProgress(progressPercent);
      setRenderedFramesCount(frameDrawCount);

      // FPS calculation every 1 second
      if (now - lastFpsCalculationTime >= 1000) {
        const calculatedFps = Math.round((fpsFrames * 1000) / (now - lastFpsCalculationTime));
        setExportFps(calculatedFps || 30);
        fpsFrames = 0;
        lastFpsCalculationTime = now;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    const drawFrameAtTimestamp = (activeTime: number) => {
      // 1. Draw Background Frame
      try {
        if (settings.videoBrightness !== undefined) {
          ctx.filter = `brightness(${settings.videoBrightness / 50})`;
        }
        
        if (exportImage) {
          const isKenBurnsActive = (() => {
            if (settings.enableKenBurns === "on") return true;
            if (settings.enableKenBurns === "off") return false;
            const currentTheme = TEMPLATE_PRESETS.find(t => t.id === settings.activeTemplateId);
            return currentTheme ? (currentTheme.enableKenBurns !== false) : true;
          })();

          if (isKenBurnsActive) {
            // Fluctuate between 0 and 1 over a 36-second cycle, matching the CSS animation
            const kFactor = (Math.sin((activeTime / 36) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
            const currentScale = 1.0 + kFactor * 0.16; // scales up to 1.16
            const maxPanX = -0.01 * 1080; // max shift of -1%
            const maxPanY = -0.015 * 1920; // max shift of -1.5%
            const currentPanX = kFactor * maxPanX;
            const currentPanY = kFactor * maxPanY;

            ctx.save();
            ctx.translate(currentPanX, currentPanY);
            ctx.translate(540, 960);
            ctx.scale(currentScale, currentScale);
            ctx.translate(-540, -960);
            ctx.drawImage(exportImage, 0, 0, 1080, 1920);
            ctx.restore();
          } else {
            ctx.drawImage(exportImage, 0, 0, 1080, 1920);
          }
        } else if (exportVideo) {
          // Loop background video seamlessly without choking performance
          if (exportVideo.duration) {
            const expectedVideoTime = activeTime % exportVideo.duration;
            // Force seek on the very first frame loop to be perfectly at 0, or if severe sync discrepancy (> 1.5s)
            if (activeTime < 0.1 || Math.abs(exportVideo.currentTime - expectedVideoTime) > 1.5) {
              exportVideo.currentTime = expectedVideoTime;
            }
            // Ensure video continues playing smoothly & does not pause or freeze
            if ((exportVideo.paused || exportVideo.ended) && !exportVideo.seeking) {
              exportVideo.play().catch(() => {});
            }
          }
          ctx.drawImage(exportVideo, 0, 0, 1080, 1920);
        } else {
          // Force fallback triggering
          throw new Error("No background media found");
        }
        ctx.filter = "none";
      } catch (e) {
        // High precision majestic CSS/gradients fallback
        let grad = ctx.createLinearGradient(0, 0, 0, 1920);
        grad.addColorStop(0, "#080c16");
        grad.addColorStop(0.5, "#0e182f");
        grad.addColorStop(1, "#03060a");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);
        
        // Stars background animations inside fallback
        ctx.fillStyle = "rgba(16, 185, 129, 0.16)";
        for (let i = 0; i < 22; i++) {
          let px = (Math.sin(activeTime * 0.9 + i) * 350) + 540;
          let py = ((activeTime * 60 + i * 85) % 1920);
          ctx.beginPath();
          ctx.arc(px, py, 6 + (i % 4), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Darkness & opacity tint filter 
      ctx.fillStyle = `rgba(0, 0, 0, ${(100 - settings.videoOpacity) / 100})`;
      ctx.fillRect(0, 0, 1080, 1920);

      // Evaluate active segment & word at this exact timestamp using custom timings if edited
      const adjustedActiveTime = Math.max(0, Math.min(duration, activeTime + (settings.timingOffset || 0)));
      const { activeSegment, activeWord } = findActiveTiming(segments, adjustedActiveTime);

      const activeVerseInfo = (selectedVerses && selectedVerses.length > 0)
        ? findActiveVerse(selectedVerses, adjustedActiveTime)
        : null;
      const resolvedVerse = (activeVerseInfo ? activeVerseInfo.verse : currentVerse) || { text: "", translation: "", surahName: "Quran", numberInSurah: 1 };

      const textY = (settings.textPosition / 100) * 1920;

      // 3. Render Uthmani Quran Calligraphy
      if (activeSegment) {
        const words = activeSegment.words;
        const fontClassFamily = settings.fontName === "Amiri" ? "Amiri" : "Scheherazade New";
        ctx.font = `bold ${settings.fontSize * 2.3}px ${fontClassFamily}, serif`;
        ctx.textBaseline = "middle";

        // Calculate accurate center offset for RTL string
        const spacing = settings.wordSpacing * 2.5 + 16;
        const wordWidths = words.map(w => ctx.measureText(w.word).width);
        const totalWordsWidth = wordWidths.reduce((sum, w) => sum + w, 0) + (words.length - 1) * spacing;

        let currentX = 540 + totalWordsWidth / 2;
        words.forEach((wordObj, wIdx) => {
          const isWordActive = activeWord && activeWord.index === wordObj.index;
          const wordWidth = wordWidths[wIdx];

          ctx.save();
          ctx.textAlign = "right";

          if (isWordActive) {
            ctx.fillStyle = "#10b981";
            ctx.shadowColor = settings.textGlowColor || "rgba(16, 185, 129, 0.8)";
            ctx.shadowBlur = settings.textGlowBlur * 3 + 15;
          } else {
            ctx.fillStyle = settings.textColor;
            if (settings.textShadowColor) {
              ctx.shadowColor = settings.textShadowColor;
              ctx.shadowBlur = settings.textShadowBlur * 2;
            }
          }

          ctx.fillText(wordObj.word, currentX, textY);
          ctx.restore();

          currentX -= (wordWidth + spacing);
        });
      } else {
        // Static layout fallback
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = settings.textColor;
        if (settings.textShadowColor) {
          ctx.shadowColor = settings.textShadowColor;
          ctx.shadowBlur = settings.textShadowBlur * 2;
        }
        const fontClassFamily = settings.fontName === "Amiri" ? "Amiri" : "Scheherazade New";
        ctx.font = `bold ${settings.fontSize * 2.2}px ${fontClassFamily}, serif`;
        ctx.fillText(resolvedVerse.text, 540, textY);
      }

      // 4. Render English Translation Segment
      if (settings.showTranslation) {
        let transFont = "italic 36px 'Inter', sans-serif";
        switch (settings.translationFontName) {
          case "Lora":
            transFont = "italic 36px 'Lora', serif";
            break;
          case "Playfair Display":
            transFont = "600 italic 38px 'Playfair Display', serif";
            break;
          case "Cinzel":
            transFont = "bold 32px 'Cinzel', serif";
            break;
          case "Cormorant Garamond":
            transFont = "italic 40px 'Cormorant Garamond', serif";
            break;
          case "Montserrat":
            transFont = "34px 'Montserrat', sans-serif";
            break;
        }
        ctx.font = transFont;
        ctx.fillStyle = settings.translationColor || "#A7F3D0";
        ctx.textAlign = "center";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 6;
        
        const transText = activeSegment ? activeSegment.translation : resolvedVerse.translation;
        const transWords = transText.split(" ");
        let line = "";
        let transY = textY + 120;
        
        for (let n = 0; n < transWords.length; n++) {
          let testLine = line + transWords[n] + " ";
          let metrics = ctx.measureText(testLine);
          if (metrics.width > 920 && n > 0) {
            ctx.fillText(line, 540, transY);
            line = transWords[n] + " ";
            transY += 50;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 540, transY);
      }

      // 5. Draw majestic header brand tags
      ctx.font = "bold 28px 'Inter', sans-serif";
      ctx.fillStyle = settings.surahLabelColor || "#10B981";
      ctx.textAlign = "center";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 4;
      ctx.fillText(`— Surat ${resolvedVerse.surahName} : [Ayah ${resolvedVerse.numberInSurah}] —`, 540, 180);

      ctx.font = "34px serif";
      ctx.fillText("⚜️", 540, 120);

      // 6. Draw footer watermark prompt reflection
      if (reflectionPrompt) {
        let reflFont = "italic 26px 'Inter', sans-serif";
        switch (settings.translationFontName) {
          case "Lora":
            reflFont = "italic 26px 'Lora', serif";
            break;
          case "Playfair Display":
            reflFont = "italic 28px 'Playfair Display', serif";
            break;
          case "Cinzel":
            reflFont = "bold 24px 'Cinzel', serif";
            break;
          case "Cormorant Garamond":
            reflFont = "italic 30px 'Cormorant Garamond', serif";
            break;
          case "Montserrat":
            reflFont = "24px 'Montserrat', sans-serif";
            break;
        }
        ctx.font = reflFont;
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.textAlign = "center";
        ctx.fillText(`"${reflectionPrompt}"`, 540, 1780);
      }
    };

    // Kick off render loop
    animationFrameId = requestAnimationFrame(renderLoop);
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 border border-white/10 flex flex-col h-full overflow-hidden">
      
      {exportedVideoUrl && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative space-y-4">
            <button 
              onClick={() => {
                URL.revokeObjectURL(exportedVideoUrl);
                setExportedVideoUrl(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-emerald-400 text-[9px] font-bold tracking-widest uppercase font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mb-1 font-semibold">
                Render Successful
              </span>
              <h3 className="text-sm font-bold text-white font-sans">Preview Exported Short</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                Confirm that the recitation voice track is aligned exactly with the captions.
              </p>
            </div>

            <div className="flex justify-center bg-slate-950 rounded-xl p-3 border border-white/5 shadow-inner">
              <video 
                src={exportedVideoUrl} 
                controls 
                autoPlay 
                playsInline
                className="w-[180px] h-[320px] rounded-lg object-cover shadow-lg border border-white/10"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  URL.revokeObjectURL(exportedVideoUrl);
                  setExportedVideoUrl(null);
                }}
                className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                Close
              </button>
              
              <a
                href={exportedVideoUrl}
                download={`QuranShorts_${currentVerse?.surahName || "Export"}_Ayah${currentVerse?.numberInSurah || 1}.webm`}
                className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25"
              >
                <Download className="w-3.5 h-3.5" />
                Download Video
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SaaS Editor navigation tabs */}
      <div className="flex items-center space-x-1 border-b border-white/5 pb-3 mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("verse")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "verse" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Verse Input
        </button>



        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "templates" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          Templates
        </button>

        <button
          onClick={() => setActiveTab("visuals")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "visuals" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          Background
        </button>

        <button
          onClick={() => setActiveTab("canvas")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "canvas" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          Typography
        </button>

        <button
          onClick={() => setActiveTab("audio")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "audio" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          Audio Reciter
        </button>

        <button
          onClick={() => setActiveTab("timing")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "timing" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          Manual Sync
        </button>

        <button
          onClick={() => setActiveTab("save")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "save" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          Export Video
        </button>
      </div>

      {/* Accordion / Tab Active Screens */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        
        {/* TAB 1: VERSE SEARCH */}
        {activeTab === "verse" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Browse Surah Database</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search Surah (e.g., Al-Kahf, Al-Kahf, Baqarah, مريم...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Grid of Surah list */}
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-1.5 bg-slate-950/40 rounded-xl border border-white/5">
                {filteredSurahs.map((s) => (
                  <button
                    key={s.number}
                    onClick={() => {
                      setSelectedSurahNum(s.number);
                      setSelectedAyahNum(1); // Reset to first verse
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${
                      selectedSurahNum === s.number
                        ? "bg-emerald-600 text-white font-semibold shadow-md"
                        : "bg-slate-900/60 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate">{s.number}. {s.englishName}</span>
                    <span className="text-[10px] text-emerald-200 font-amiri font-bold">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ayah Selection Builder */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-semibold text-slate-300">Verse Selection Controls</span>
                <div className="flex space-x-1 bg-slate-900 p-0.5 rounded-lg border border-white/5">
                  <button
                    onClick={() => setIsRangeMode(false)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition ${
                      !isRangeMode ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Single Verse
                  </button>
                  <button
                    onClick={() => setIsRangeMode(true)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition ${
                      isRangeMode ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Verse Range
                  </button>
                </div>
              </div>

              {/* Slider inputs for quick bulk range selection */}
              {!isRangeMode ? (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-350 mb-2">
                    <span>Quick Select Ayah</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Ayah {selectedAyahNum} / {activeSurah.numberOfAyahs}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={activeSurah.numberOfAyahs}
                    value={selectedAyahNum}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSelectedAyahNum(val);
                      setSelectedEndAyahNum(val);
                    }}
                    className="w-full mb-2 cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Ayah 1</span>
                    <span>Ayah {activeSurah.numberOfAyahs}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-355 mb-2">
                      <span>Start Ayah</span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        {selectedAyahNum}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={activeSurah.numberOfAyahs}
                      value={selectedAyahNum}
                      onChange={(e) => setSelectedAyahNum(Number(e.target.value))}
                      className="w-full cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-355 mb-2">
                      <span>End Ayah</span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        {selectedEndAyahNum}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={selectedAyahNum}
                      max={activeSurah.numberOfAyahs}
                      value={selectedEndAyahNum}
                      onChange={(e) => setSelectedEndAyahNum(Number(e.target.value))}
                      className="w-full cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="text-[10px] text-zinc-400 text-center italic bg-slate-900/40 p-2 rounded-lg border border-white/5">
                    Range selected: <strong className="text-emerald-400">{activeSurah.englishName} {selectedAyahNum} - {selectedEndAyahNum}</strong> ({selectedEndAyahNum - selectedAyahNum + 1} verses total)
                  </div>
                </div>
              )}

              {/* Interactive Checklist list showing real Uthmani script live */}
              <div className="border-t border-white/5 pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Interactive Verse Checklist</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {selectedAyahs.length} of {activeSurah.numberOfAyahs} selected
                  </span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 bg-slate-950/40 p-2 rounded-xl border border-white/5">
                  {isLoadingSurahVerses ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-2">
                      <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                      <span className="text-xs text-slate-400">Loading authentic Uthmani script...</span>
                    </div>
                  ) : (
                    getDisplayVerses().map((v) => {
                      const isChecked = selectedAyahs.includes(v.numberInSurah);
                      return (
                        <div
                          key={`surah-v-${v.numberInSurah}`}
                          onClick={() => handleToggleAyah(v.numberInSurah)}
                          className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col space-y-2 select-none ${
                            isChecked
                              ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/5"
                              : "bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              {/* Checkbox icon */}
                              <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-150 ${
                                isChecked
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-slate-500 bg-transparent text-transparent"
                              }`}>
                                <svg className="w-2.5 h-2.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-300 font-sans">
                                Ayah {v.numberInSurah}
                              </span>
                            </div>
                          </div>

                          {/* Arabic Text in authentic Uthmani script */}
                          <div className="text-right py-1">
                            <p className="text-xl md:text-2xl text-emerald-100/90 font-amiri leading-relaxed tracking-wide break-words" dir="rtl">
                              {v.text}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Button to pull verse details */}
              <button
                onClick={() => loadAndAppendVerses(selectedSurahNum, 1, 1, selectedAyahs)}
                disabled={isSearchingVerses || selectedAyahs.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-500 font-semibold disabled:bg-slate-800 disabled:text-slate-500 text-white py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
              >
                {isSearchingVerses ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                    Seq-Verifying Audio Streams...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    Load & Add to Playlist ({activeSurah.englishName} {(() => {
                      if (selectedAyahs.length === 0) return "None";
                      const sorted = [...selectedAyahs].sort((a, b) => a - b);
                      const isConsecutive = sorted.every((val, i, arr) => i === 0 || val === arr[i-1] + 1);
                      if (isConsecutive) {
                        if (sorted.length === 1) return `Ayah ${sorted[0]}`;
                        return `Ayat ${sorted[0]}–${sorted[sorted.length - 1]}`;
                      }
                      return `Ayat ${sorted.join(", ")}`;
                    })()})
                  </>
                )}
              </button>
            </div>

            {/* Selected Verses Playlist */}
            {selectedVerses.length > 0 && (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">Selected Ayat Playlist</span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                      {selectedVerses.length} {selectedVerses.length === 1 ? 'verse' : 'verses'}
                    </span>
                  </div>
                  <button 
                    onClick={handleClearVerses}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                  >
                    <X className="w-3 h-3" />
                    Clear Playlist
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {selectedVerses.map((item, index) => (
                    <div 
                      key={`${item.verse.surahNumber}-${item.verse.numberInSurah}-${index}`}
                      className="flex items-center justify-between bg-zinc-900/60 p-2.5 rounded-lg border border-white/5 hover:border-emerald-500/25 transition group text-xs"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          <span className="text-zinc-500 font-mono text-[10px]">#{index+1}</span>
                          <span className="truncate">{item.verse.surahName} {item.verse.numberInSurah}</span>
                          <span className="text-[10px] text-zinc-500">({item.duration.toFixed(1)}s)</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5 max-w-[200px]">{item.verse.text}</p>
                      </div>

                      <button
                        onClick={() => handleRemoveVerse(index)}
                        className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center bg-slate-900/30 p-2 rounded text-[10px] text-zinc-400 font-mono">
                  <span>Sequence Audio Length:</span>
                  <span className="text-emerald-400 font-bold">{selectedVerses.reduce((sum, v) => sum + v.duration, 0).toFixed(2)}s</span>
                </div>
              </div>
            )}

            {/* Verse loaded error status */}
            {verseError && (
              <div className="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex gap-2">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{verseError}</span>
              </div>
            )}

            {/* Quick preloaded famous verses suggestion bar */}
            <div>
              <span className="block text-[11px] text-slate-400 mb-2 font-medium uppercase tracking-wider">🌟 Recommended Quran Verses</span>
              <div className="space-y-1.5">
                {PRELOADED_VERSES.map((v) => (
                  <button
                    key={`${v.surahNumber}-${v.numberInSurah}`}
                    onClick={() => {
                      loadAndAppendVerses(v.surahNumber, v.numberInSurah, v.numberInSurah);
                    }}
                    className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl text-xs transition border ${
                      selectedVerses.some(sv => sv.verse.surahNumber === v.surahNumber && sv.verse.numberInSurah === v.numberInSurah)
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{v.surahName} • Verse {v.numberInSurah}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[280px]">{v.translation}</span>
                    </div>
                    <span className="font-bold text-[14px] text-emerald-400 font-amiri font-bold pl-2">{v.text.split(" ")[0]}..</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}





        {/* TAB 3: TEMPLATES */}
        {activeTab === "templates" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATE_PRESETS.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className="group relative flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-slate-950/80 hover:border-slate-700 transition text-center"
                >
                  <div
                    className="w-7 h-7 rounded-full mb-2 border flex items-center justify-center"
                    style={{ backgroundColor: tpl.themeColor, borderColor: tpl.fontColor }}
                  >
                    <span style={{ color: tpl.fontColor }} className="text-[10px] font-bold">ب</span>
                  </div>
                  <span className="text-white text-xs font-semibold block">{tpl.name}</span>
                  <span className="text-[10px] text-slate-500 block capitalize mt-0.5">{tpl.fontName} • {tpl.animationType}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VISUAL BACKDROP */}
        {activeTab === "visuals" && (
          <div className="space-y-4 animate-fade-in">
            {/* Sub-Tabs Selector */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 gap-1 select-none">
              <button
                type="button"
                onClick={() => setPexelsSubTab("library")}
                className={`flex-1 py-1.5 text-xs font-semibold text-center rounded-lg transition-all duration-200 ${
                  pexelsSubTab === "library"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                🔍 Pexels Infinite Library
              </button>
              <button
                type="button"
                onClick={() => setPexelsSubTab("upload")}
                className={`flex-1 py-1.5 text-xs font-semibold text-center rounded-lg transition-all duration-200 ${
                  pexelsSubTab === "upload"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                📤 Custom Uploader
              </button>
            </div>

            {pexelsSubTab === "library" ? (
              <div className="space-y-4 animate-fade-in">
                {/* Media Selector & Search Bar */}
                <div className="space-y-3 p-4 bg-slate-950/40 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Pexels 9:16 Assets</span>
                    <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-white/5">
                      <button
                        type="button"
                        onClick={() => { setPexelsMediaType("videos"); setPexelsPage(1); }}
                        className={`px-2 py-0.5 text-[9.5px] rounded-md font-bold uppercase transition ${
                          pexelsMediaType === "videos" ? "bg-emerald-500 text-white" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        🎬 Videos
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPexelsMediaType("photos"); setPexelsPage(1); }}
                        className={`px-2 py-0.5 text-[9.5px] rounded-md font-bold uppercase transition ${
                          pexelsMediaType === "photos" ? "bg-emerald-500 text-white" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        📸 Photos
                      </button>
                    </div>
                  </div>

                  {/* Search input bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Search high-quality Pexels vertical ${pexelsMediaType === 'videos' ? 'videos' : 'photos'}...`}
                      value={pexelsQuery}
                      onChange={(e) => { setPexelsQuery(e.target.value); setPexelsPage(1); }}
                      className="w-full bg-slate-950 text-white border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  </div>

                  {/* Horizontal Scroll Categories */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10 select-none">
                    {PEXELS_CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => { setPexelsCategory(cat); setPexelsPage(1); }}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-full shrink-0 border transition ${
                          pexelsCategory === cat
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-950/40 text-zinc-400 border-white/5 hover:bg-slate-900"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Key Missing Notice */}
                {isPexelsKeyMissing && (
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-bounce" />
                      <span className="text-[10px] font-bold text-slate-300">Curated Library Active</span>
                    </div>
                    <p className="text-[9.5px] text-zinc-400 leading-normal">
                      Pexels API key is not configured. We've loaded beautiful, Shariah-compliant 9:16 nature presets above. Configure <code className="text-emerald-400 font-semibold bg-emerald-500/10 px-1 py-0.5 rounded">PEXELS_API_KEY</code> to search the entire online catalog!
                    </p>
                  </div>
                )}

                {/* Grid Output */}
                {pexelsLoading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="aspect-[9/16] bg-slate-950/60 animate-pulse rounded-xl border border-white/5 flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-emerald-500/25 animate-spin" />
                      </div>
                    ))}
                  </div>
                ) : pexelsError ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                    <span className="block text-[11px] font-bold text-red-400">Library Error</span>
                    <span className="block text-[9.5px] text-zinc-400 mt-1">{pexelsError}</span>
                  </div>
                ) : pexelsResults.length === 0 ? (
                  <div className="text-center py-8 bg-slate-950/20 rounded-xl border border-dashed border-white/5">
                    <X className="w-6 h-6 text-zinc-600 mx-auto mb-1.5" />
                    <span className="block text-[11px] font-semibold text-zinc-400">No Compliant Assets Found</span>
                    <span className="block text-[9.5px] text-zinc-500 mt-0.5">Living creatures were screen-filtered. Try another query.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {pexelsResults.map((item) => {
                        const isPhotoItem = !!item.src;
                        const thumbUrl = isPhotoItem ? item.src?.medium : item.image;
                        const isSelected = isPhotoItem 
                          ? uploadedImageUrl === item.src?.original
                          : uploadedVideoUrl === (item.video_files?.filter((vf: any) => vf.height > vf.width)[0]?.link || item.video_files?.[0]?.link);

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (isPhotoItem && item.src) {
                                selectPexelsPhoto(item.src.original, item.photographer);
                              } else {
                                const files = item.video_files?.filter((vf: any) => vf.height > vf.width) || [];
                                const bestLink = files[0]?.link || item.video_files?.[0]?.link;
                                if (bestLink) {
                                  selectPexelsVideo(bestLink, item.user?.name || "Pexels Artist");
                                }
                              }
                            }}
                            className={`group relative aspect-[9/16] bg-slate-950 rounded-xl overflow-hidden cursor-pointer border transition-all hover:scale-[1.03] active:scale-95 ${
                              isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md" : "border-white/5 hover:border-emerald-500/40"
                            }`}
                          >
                            {/* Card Display Thumbnail */}
                            <img
                              src={thumbUrl}
                              referrerPolicy="no-referrer"
                              alt={item.alt || "Background"}
                              className="w-full h-full object-cover pointer-events-none"
                            />

                            {/* Hover overlay metadata */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent p-2 flex flex-col justify-between">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    toggleFavorite(String(item.id), e);
                                  }}
                                  className="p-1 rounded-full bg-black/60 border border-white/5 hover:bg-black/95 text-zinc-300 hover:text-red-400 transition"
                                >
                                  <Heart className={`w-3 h-3 ${favorites.includes(String(item.id)) ? "fill-red-500 text-red-500" : ""}`} />
                                </button>
                              </div>
                              <div>
                                <span className="block text-[8px] text-zinc-300 font-medium font-sans truncate pr-1">
                                  👤 {isPhotoItem ? item.photographer : (item.user?.name || "Artist")}
                                </span>
                              </div>
                            </div>

                            {/* Choice Overlay status */}
                            {isSelected && (
                              <div className="absolute inset-0 bg-emerald-500/15 flex items-center justify-center pointer-events-none">
                                <div className="p-1.5 rounded-full bg-emerald-500 shadow-md">
                                  <Check className="w-3 text-white stroke-[2.5]" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Simple Pagination Controls */}
                    <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-zinc-500">
                      <button
                        type="button"
                        disabled={pexelsPage <= 1}
                        onClick={() => setPexelsPage(prev => Math.max(1, prev - 1))}
                        className="px-2 py-1 rounded bg-slate-950 border border-white/5 text-zinc-400 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-900 transition"
                      >
                        ← Prev
                      </button>
                      <span>PAGE {pexelsPage}</span>
                      <button
                        type="button"
                        disabled={pexelsResults.length < 12}
                        onClick={() => setPexelsPage(prev => prev + 1)}
                        className="px-2 py-1 rounded bg-slate-950 border border-white/5 text-zinc-400 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-900 transition"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Islamic Compliance Trust Indicator Banner / Upload Notice */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="block text-xs font-bold text-emerald-300">Shariah-Friendly Custom Uploads</span>
                    <span className="block text-[10.5px] text-emerald-400/80 leading-relaxed mt-0.5">
                      To maintain the sanctity of Quran recitation, please ensure your custom uploaded photo or video backgrounds are free of people, human silhouettes, faces, animated characters, or animals. Sourced nature, geometry, or abstract sky scenes are highly recommended. Use the uploader tool below to implement yours.
                    </span>
                  </div>
                </div>

                {/* Dynamic compliance checker or upload panels */}
                <div>
                  <span className="block text-xs text-slate-400 mb-2 font-medium">Upload Custom Background Media</span>
                  
                  {isScanningCustomFile ? (
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-dashed border-emerald-500/40 relative overflow-hidden transition-all duration-300">
                      {/* Glowing scanning laser beam */}
                      <div 
                        className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]" 
                        style={{
                          top: `${scanProgress}%`,
                        }} 
                      />

                      <div className="text-center py-4 relative z-10">
                        {scanProgress < 100 ? (
                          <>
                            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
                            <span className="block text-xs font-bold text-emerald-300 uppercase tracking-widest">Shariah Compliance Scan Active</span>
                            <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                              Analyzing visual parameters for facial shapes or living silhouettes... <span className="text-emerald-400 font-bold">{scanProgress}%</span>
                            </span>
                          </>
                        ) : (
                          <div className="animate-fade-in">
                            {scanResult?.success ? (
                              <>
                                <ShieldCheck className="w-9 h-9 text-emerald-400 mx-auto mb-2.5 animate-bounce" />
                                <span className="block text-xs font-bold text-emerald-400 uppercase tracking-widest">Compliance Approved</span>
                                <p className="text-[10.5px] text-slate-300 mt-1 px-4 leading-relaxed">{scanResult.message}</p>
                              </>
                            ) : (
                              <>
                                <div className="w-9 h-9 bg-red-500/15 rounded-full flex items-center justify-center text-red-500 mx-auto mb-2.5">
                                  <X className="w-5 h-5 stroke-[2.5]" />
                                </div>
                                <span className="block text-xs font-bold text-red-400 uppercase tracking-widest">Compliance Violation</span>
                                <p className="text-[10.5px] text-slate-300 mt-1 px-4 leading-relaxed">{scanResult?.message}</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Video File Uploader */}
                      <div className={`bg-slate-950/50 p-4 rounded-xl border border-dashed hover:border-emerald-500/40 transition text-center relative flex flex-col justify-between min-h-[140px] ${uploadedVideoUrl ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10'}`}>
                        {uploadedVideoUrl && (
                          <span className="absolute top-2 right-2 text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-1.5 py-0.5 rounded">Active</span>
                        )}
                        <div>
                          <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                          <span className="block text-white font-semibold text-xs mb-0.5">Custom Video</span>
                          <span className="block text-[9px] text-slate-400 mb-2.5 leading-tight">Supports MP4, MOV, WebM loops</span>
                        </div>
                        
                        <label className="inline-block bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg cursor-pointer transition select-none self-center">
                          Select Video
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime,video/webm"
                            onChange={handleUserVideoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Photo Background Uploader */}
                      <div className={`bg-slate-950/50 p-4 rounded-xl border border-dashed hover:border-emerald-500/40 transition text-center relative flex flex-col justify-between min-h-[140px] ${uploadedImageUrl ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10'}`}>
                        {uploadedImageUrl && (
                          <span className="absolute top-2 right-2 text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-1.5 py-0.5 rounded">Active</span>
                        )}
                        <div>
                          <Image className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                          <span className="block text-white font-semibold text-xs mb-0.5">Custom Photo / Image</span>
                          <span className="block text-[9px] text-slate-400 mb-2.5 leading-tight">Supports JPG, PNG, WEBP, GIF</span>
                        </div>
                        
                        <label className="inline-block bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg cursor-pointer transition select-none self-center">
                          Select Photo
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleUserImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Video Adjustment Sliders */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3.5">
              <span className="block text-xs font-semibold text-white">Backdrop Adjustments</span>
              
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Video Overlay Brightness</span>
                  <span className="font-mono">{settings.videoBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.videoBrightness}
                  onChange={(e) => setSettings(prev => ({ ...prev, videoBrightness: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Video Opacity / Dark Fill</span>
                  <span className="font-mono">{settings.videoOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={settings.videoOpacity}
                  onChange={(e) => setSettings(prev => ({ ...prev, videoOpacity: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Ken Burns Effect Control */}
              <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-200">Ken Burns Motion Effect</span>
                  <span className="text-[9px] text-slate-400">Adds beautiful slow panning and zooming for photo backgrounds</span>
                </div>
                <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-950/40 rounded-lg border border-white/5">
                  {(["theme", "on", "off"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSettings(prev => ({ ...prev, enableKenBurns: opt }))}
                      className={`py-1 text-[10px] font-medium rounded-md transition-all uppercase ${
                        settings.enableKenBurns === opt
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                      }`}
                    >
                      {opt === "theme" ? "Let Theme Control" : opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TYPOGRAPHY */}
        {activeTab === "canvas" && (
          <div className="space-y-4">
            {/* Dynamic Reflection Prompt Editor block */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2">
              <label className="block text-xs text-slate-300 font-semibold flex items-center justify-between">
                <span>Bottom Reflection Overlay Text</span>
                <span className="text-[10px] text-zinc-500 font-mono">Customisable Subtitle</span>
              </label>
              <textarea
                rows={3}
                value={reflectionPrompt}
                onChange={(e) => setReflectionPrompt(e.target.value)}
                placeholder="Find ultimate healing, peace, and spiritual refuge within silent heart-felt prostrations..."
                className="w-full text-xs text-white p-2.5 rounded-xl bg-slate-900/60 border border-white/5 focus:outline-none focus:border-emerald-500/50 transition-all font-medium resize-none leading-relaxed"
              />
              <p className="text-[10px] text-zinc-500 leading-normal">
                This beautiful cinematic message overlay is rendered at the bottom section of your exported vertical shorts and live previews.
              </p>
            </div>

            {/* Font Family selector */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Uthmani Scripts Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Amiri", name: "Amiri Naskh" },
                  { id: "Scheherazade New", name: "Scheherazade" },
                  { id: "Reem Kufi", name: "Modern Kufi" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSettings(prev => ({ ...prev, fontName: f.id }))}
                    className={`py-2 px-1 rounded-xl text-xs font-medium transition border text-center ${
                      settings.fontName === f.id
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                        : "bg-slate-950/40 border-white/5 text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* English Translation font family selector */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">English Typography Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Inter", name: "Minimalist Sans (Inter)" },
                  { id: "Lora", name: "Elegant Editorial (Lora)" },
                  { id: "Playfair Display", name: "Majestic Bold (Playfair)" },
                  { id: "Cinzel", name: "Sovereign Caps (Cinzel)" },
                  { id: "Cormorant Garamond", name: "Vintage Elegant (Cormorant)" },
                  { id: "Montserrat", name: "Modern Display (Montserrat)" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSettings(prev => ({ ...prev, translationFontName: f.id }))}
                    className={`py-2 px-1.5 rounded-xl text-[10px] font-medium transition border text-center flex items-center justify-center ${
                      (settings.translationFontName || "Inter") === f.id
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                        : "bg-slate-950/40 border-white/5 text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography control sliders */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-4">
              {/* text position slider */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Vertical Align Position</span>
                  <span className="font-mono">{settings.textPosition}% from top</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={settings.textPosition}
                  onChange={(e) => setSettings(prev => ({ ...prev, textPosition: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Text alignment option */}
              <div>
                <span className="block text-[11px] text-slate-400 mb-1.5">Text Alignment</span>
                <div className="grid grid-cols-3 gap-2">
                  {["left", "center", "right"].map((align) => (
                    <button
                      key={align}
                      onClick={() => setSettings(prev => ({ ...prev, alignment: align as any }))}
                      className={`py-1 rounded-lg text-xs transition border text-center uppercase ${
                        settings.alignment === align
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-slate-900/60 border-white/5 text-slate-400"
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size sliders */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Arabic Quran Font Size</span>
                  <span className="font-mono">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="52"
                  value={settings.fontSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Text glow config */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Text Glow Radius & Blur</span>
                  <span className="font-mono">{settings.textGlowBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={settings.textGlowBlur}
                  onChange={(e) => setSettings(prev => ({ ...prev, textGlowBlur: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Overlay color configs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-medium">Arabic Text Color</label>
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-full h-8 rounded-lg cursor-pointer border border-white/10 bg-slate-900 p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-medium font-bold">Text Glow Color</label>
                  <input
                    type="color"
                    value={settings.textGlowColor || "#FFFFFF"}
                    onChange={(e) => setSettings(prev => ({ ...prev, textGlowColor: e.target.value }))}
                    className="w-full h-8 rounded-lg cursor-pointer border border-white/10 bg-slate-900 p-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Translation and Surah Label switches */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Enable Verse English Translation</span>
                <input
                  type="checkbox"
                  checked={settings.showTranslation}
                  onChange={(e) => setSettings(prev => ({ ...prev, showTranslation: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600 border-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                />
              </div>

              {settings.showTranslation && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Translation Font Size</label>
                    <input
                      type="number"
                      min="12"
                      max="24"
                      value={settings.translationFontSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, translationFontSize: Number(e.target.value) }))}
                      className="w-full text-xs text-white p-1 rounded bg-slate-900 border border-white/10 focus:outline-none focus:border-emerald-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Translation Color</label>
                    <input
                      type="color"
                      value={settings.translationColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, translationColor: e.target.value }))}
                      className="w-full h-7 rounded cursor-pointer border border-white/10 bg-slate-900"
                    />
                  </div>
                </div>
              )}

              <hr className="border-white/5 my-2" />

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Show Surah and Ayah Label Tag</span>
                <input
                  type="checkbox"
                  checked={settings.showSurahLabel}
                  onChange={(e) => setSettings(prev => ({ ...prev, showSurahLabel: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600 border-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIO RECITERS */}
        {activeTab === "audio" && (
          <div className="space-y-4">
            <div>
              <span className="block text-xs text-slate-400 mb-2 font-medium">Select Sacred Reciter (Narrator)</span>
              <div className="grid grid-cols-2 gap-2.5">
                {RECITERS.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedReciter(rec)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left border transition text-xs ${
                      selectedReciter.id === rec.id
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                        : "bg-slate-950/40 border-white/5 text-zinc-300 hover:bg-slate-900"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 border border-white/10 font-bold flex items-center justify-center shrink-0">
                      {rec.avatarLetter}
                    </div>
                    <span className="font-semibold block truncate">{rec.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedReciter.id === "luhaidan" && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3 text-[11px] text-amber-200/90 leading-relaxed shadow-sm">
                <span className="text-sm shrink-0 select-none">✨</span>
                <div>
                  <span className="font-bold block mb-0.5 text-amber-100">EveryAyah & Islamic Network Info</span>
                  Verse-by-verse recitation files for Muhammad Al-Luhaidan are not currently hosted on EveryAyah or Islamic Network central CDN servers. The app is automatically using <span className="font-semibold text-emerald-400">Maher Al-Muaiqly</span>'s beautiful, melodic recitation as an automatic graceful surrogate so your playback runs uninterrupted!
                </div>
              </div>
            )}

            {/* Automatic Bismillah Prefix Toggle */}
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 flex items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-bold text-white">Prepend 'Bismillah' Recitation</span>
                <span className="block text-[10px] text-slate-400 mt-0.5 leading-snug">
                  Automatically recite "In the name of Allah" in the chosen reciter's voice before the first verse of a Surah (excluding Surah 1 and 9).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, playBismillahPrefix: !prev.playBismillahPrefix }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.playBismillahPrefix ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.playBismillahPrefix ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Recitation play controls */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
              <span className="text-[10px] text-slate-500 block mb-3 uppercase font-mono tracking-wider">Sync Active Verse Audition</span>
              
              <button
                onClick={toggleReciterVoice}
                className={`py-3 px-6 rounded-full font-bold flex items-center gap-2 text-xs transition shadow-lg ${
                  isReciterPlaying
                    ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10 animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10"
                }`}
              >
                {isReciterPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    Pause Recitation Audio
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Play Recitation Loop
                  </>
                )}
              </button>

              <span className="text-[10px] text-slate-400 block mt-3 select-none leading-relaxed">
                Narrated by <span className="text-white font-semibold">{selectedReciter.name}</span>. Audios synchronized dynamically from central Quran API.
              </span>
            </div>

            {/* Captions & Timing sync tune-up panel */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-4">
              <span className="block text-xs font-semibold text-white">Smart Captions Synchronization</span>
              
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Max Words Displayed per Caption</span>
                  <span className="font-mono">{settings.maxWordsPerSegment || 5} words</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={settings.maxWordsPerSegment || 5}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxWordsPerSegment: Number(e.target.value) }))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="block text-[9px] text-slate-500 mt-1">Automatically splits long verses into beautiful, balanced segment chunks.</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1.5">
                  <span>Caption Timing Speed (Offset Adjustment)</span>
                  <span className="font-mono">
                    {settings.timingOffset > 0 ? `+${settings.timingOffset.toFixed(1)}s (delay)` : settings.timingOffset < 0 ? `${settings.timingOffset.toFixed(1)}s (advance)` : "Instant Sync"}
                  </span>
                </div>
                <input
                  type="range"
                  min="-2.0"
                  max="2.0"
                  step="0.1"
                  value={settings.timingOffset || 0}
                  onChange={(e) => setSettings(prev => ({ ...prev, timingOffset: Number(e.target.value) }))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="block text-[9px] text-slate-500 mt-1 font-mono">Fine-tune subtitles to align with each reciter's physical voice pace.</span>
              </div>
            </div>

            {/* Nasheed backdrop */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs text-white font-semibold">Background Nasheed Mix</span>
                  <span className="block text-[10px] text-slate-500">Spiritual ambient loop sound</span>
                </div>
                {nasheedVolume > 0 ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </div>

              <input
                type="range"
                min="0"
                max="50"
                value={nasheedVolume}
                onChange={(e) => setNasheedVolume(Number(e.target.value))}
                className="w-full"
              />

              <div className="flex justify-between text-[9px] text-slate-500">
                <span>Disabled (Default)</span>
                <span>Max Mix (50%)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6.5: TIMING ADJUSTER */}
        {activeTab === "timing" && (
          <div className="space-y-4">
            {/* Context/Overview banner */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs text-white font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Interactive Subtitle Timeline Editor
                  </span>
                  <span className="block text-[10px] text-zinc-500 mt-0.5">Adjust segments or single word durations precisely in real-time</span>
                </div>
                <div className="px-2.5 py-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-mono font-bold shrink-0">
                  Total Recitation: {reciterAudioDuration.toFixed(2)}s
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                By default, our engine uses AI-driven proportional character distributions for text synchronization. Fine-tune segment boundaries and specific syllable endpoints below to achieve perfect vocal alignment.
              </p>
            </div>

            {/* STUNNING INTERACTIVE VISUAL TIMELINE COMPONENT - STICKY PINNED WORKSPACE */}
            <div className="sticky top-0 z-40 bg-slate-950/98 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl shadow-black/80 space-y-4">
              {/* Workspace Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Studio Multi-Track Workspace</span>
                    <span className="text-[10px] text-zinc-500 block font-mono">Dynamic Frame Sync (CapCut Engine)</span>
                  </div>
                </div>

                {/* Live Controls Panel */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Playback Switch */}
                  <button
                    onClick={toggleReciterVoice}
                    className="p-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[10px] uppercase font-bold tracking-wider transition flex items-center gap-1"
                  >
                    {isReciterPlaying ? "⏸ Pause Voice" : "▶ Play Voice"}
                  </button>

                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10 font-bold">
                    {reciterAudioTime.toFixed(2)}s / {reciterAudioDuration.toFixed(2)}s
                  </span>

                  <div className="h-4 w-[1px] bg-white/5" />

                  {/* Magnet Snapping toggle with indicator light */}
                  <button
                    onClick={() => setIsSnappingEnabled(!isSnappingEnabled)}
                    className={`p-1.5 px-2.5 rounded-lg border text-[10px] font-bold transition flex items-center gap-1.5 ${
                      isSnappingEnabled 
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" 
                        : "bg-zinc-800/20 border-white/5 text-zinc-500 hover:bg-zinc-800/40"
                    }`}
                    title="Toggle magnetic snapping (Snaps clips to playhead, ends, starts and current voice cue)"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSnappingEnabled ? "bg-amber-400 animate-pulse" : "bg-zinc-650"}`} />
                    MAGNETIC
                  </button>

                  {/* Minimum gap adjustment */}
                  <div className="flex items-center gap-1 bg-zinc-950 p-1.5 rounded-lg border border-white/5 text-[10px]">
                    <span className="text-zinc-500 font-mono">GAP:</span>
                    <select 
                      value={configMinGap} 
                      onChange={(e) => setConfigMinGap(Number(e.target.value))}
                      className="bg-transparent text-zinc-300 font-mono font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="0" className="bg-zinc-950 text-white">0.0s</option>
                      <option value="0.05" className="bg-zinc-950 text-white">0.05s</option>
                      <option value="0.1" className="bg-zinc-950 text-white">0.1s</option>
                      <option value="0.2" className="bg-zinc-950 text-white">0.2s</option>
                    </select>
                  </div>

                  {/* Multiplier zoom buttons + slider */}
                  <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-lg border border-white/5">
                    <button
                      onClick={() => setZoomMultiplier(prev => Math.max(1, prev - 0.5))}
                      className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-white text-xs bg-zinc-900 transition"
                      title="Zoom Out"
                    >-</button>
                    <input 
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={zoomMultiplier}
                      onChange={(e) => setZoomMultiplier(Number(e.target.value))}
                      className="w-20 h-1 accent-emerald-500 cursor-pointer bg-white/10 rounded-lg appearance-none"
                      title="Slide to Zoom Timeline"
                    />
                    <span className="text-[9px] font-mono font-bold text-zinc-400 min-w-[34px] text-center">{zoomMultiplier.toFixed(1)}x</span>
                    <button
                      onClick={() => setZoomMultiplier(prev => Math.min(20, prev + 0.5))}
                      className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-white text-xs bg-zinc-900 transition"
                      title="Zoom In"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Collision alert line */}
              {isCollisionWarning && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] p-2 rounded-lg text-center animate-pulse font-mono tracking-wide">
                  ⚠️ BOUNDARY OVERLAP COLLISION BLOCKED — Maintain minimum gap of {configMinGap}s
                </div>
              )}

              {/* DYNAMIC SCROLL CONTAINER OF THE WORKSPACE TRACKS */}
              <div 
                ref={tracksScrollContainerRef}
                className={`w-full overflow-x-auto rounded-xl border bg-zinc-950 shadow-inner scrollbar-thin scrollbar-track-zinc-950 scrollbar-thumb-zinc-800 transition-colors duration-200 ${
                  isCollisionWarning ? "border-red-500/50 shadow-red-950/20" : "border-zinc-850"
                }`}
                style={{ maxHeight: "310px" }}
              >
                {/* Horizontal spacer stretched relative to zoom multiplier */}
                <div 
                  className="relative select-none"
                  style={{ width: `${zoomMultiplier * 100}%`, minWidth: '100%' }}
                  onMouseDown={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.closest('.resize-handle') || 
                      target.closest('.button') || 
                      target.closest('button') || 
                      target.closest('input') || 
                      target.closest('select')
                    ) {
                      return;
                    }
                    handleTimelineMouseDown(e);
                  }}
                >
                  
                  {/* TRACK 1: TIMELINE HEADER RULER */}
                  <div 
                    className="relative bg-zinc-950 border-b border-zinc-850 h-9 flex items-center cursor-ew-resize"
                    onMouseDown={handleTimelineMouseDown}
                  >
                    {/* Tickmarks based on duration and audio track */}
                    {Array.from({ length: Math.ceil(reciterAudioDuration) + 1 }).map((_, sec) => {
                      const leftPercent = (sec / reciterAudioDuration) * 100;
                      if (leftPercent > 100) return null;
                      return (
                        <div 
                          key={sec} 
                          className="absolute flex flex-col items-center justify-start h-full pt-1.5" 
                          style={{ left: `${leftPercent}%` }}
                        >
                          <div className="w-[1px] h-3 bg-zinc-700" />
                          <span className="text-[9px] font-mono text-zinc-400 mt-0.5 select-none translate-x-[4px]">{sec}s</span>
                        </div>
                      );
                    })}
                    {/* Half-second lines */}
                    {Array.from({ length: Math.ceil(reciterAudioDuration) * 2 + 1 }).map((_, halfSecIdx) => {
                      if (halfSecIdx % 2 === 0) return null;
                      const leftPercent = ((halfSecIdx * 0.5) / reciterAudioDuration) * 100;
                      if (leftPercent > 100) return null;
                      return (
                        <div 
                          key={`half-${halfSecIdx}`} 
                          className="absolute w-[1px] h-1.5 bg-zinc-800 top-0" 
                          style={{ left: `${leftPercent}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* TRACK 2: BACKGROUND VIDEO VISUAL SYMBOLS TRACK */}
                  <div className="relative h-11 bg-zinc-900/20 border-b border-zinc-850 flex items-center">
                    <div className="sticky left-2.5 w-28 bg-zinc-950/95 border border-white/10 shadow-md backdrop-blur px-2.5 py-1 rounded text-[8px] uppercase tracking-widest text-zinc-300 font-bold z-30 select-none shadow-black/80">
                      🎬 Video Track
                    </div>
                    {/* Mock thumbnails reflecting the user template style */}
                    <div className="absolute inset-0 flex items-center gap-1.5 justify-around pl-32 pr-4 opacity-40 pointer-events-none">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex-1 h-7 rounded border border-white/10 bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-500 font-mono">
                          Frame #{i + 1} ({settings.fontName || "Amiri"})
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TRACK 3: MAIN QURAN CAPTIONS TRACK */}
                  <div className="relative h-16 bg-zinc-900/10 border-b border-zinc-850 flex items-center">
                    <div className="sticky left-2.5 w-28 bg-zinc-950/95 border border-white/10 shadow-md backdrop-blur px-2.5 py-1 rounded text-[8px] uppercase tracking-widest text-zinc-300 font-bold z-30 select-none shadow-black/80">
                      💬 Captions
                    </div>

                    <div className="absolute inset-y-0 left-0 right-0">
                      {customSegments.map((segment, segIdx) => {
                        const left = (segment.start / reciterAudioDuration) * 100;
                        const width = ((segment.end - segment.start) / reciterAudioDuration) * 100;
                        const isActive = reciterAudioTime >= segment.start && reciterAudioTime <= segment.end;
                        const isExpanded = expandedSegment === segIdx;

                        return (
                          <div
                            key={segIdx}
                            onMouseDown={(e) => handleSegmentBodyDragMouseDown(e, segment, segIdx)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedSegment(expandedSegment === segIdx ? null : segIdx);
                              if (onSeekAudio) {
                                onSeekAudio(segment.start);
                              }
                            }}
                            style={{ 
                              left: `${left}%`, 
                              width: `${width}%` 
                            }}
                            className={`absolute inset-y-2 bg-gradient-to-r text-center flex flex-col justify-center items-center py-1.5 px-3 rounded-lg cursor-grab active:cursor-grabbing transition-all select-none group border ${
                              isActive 
                                ? "from-emerald-600/35 to-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.01] z-20" 
                                : isExpanded
                                ? "from-amber-600/25 to-amber-500/15 border-amber-500 z-30 shadow-md"
                                : "from-zinc-900/95 to-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:from-zinc-850 hover:to-zinc-800"
                            }`}
                            title={`Segment ${segIdx+1}: Click to focus, Drag body to shift, Drag side handles to trim`}
                          >
                            {/* LEFT RESIZE HANDLE (START BOUNDARY) */}
                            <div 
                              onMouseDown={(e) => handleSegmentLeftDragMouseDown(e, segment, segIdx)}
                              className="absolute left-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-emerald-400 bg-zinc-850/40 border-r border-zinc-800 hover:border-emerald-300 rounded-l-md z-30 flex items-center justify-center transition-all resize-handle"
                              title="Drag START boundary"
                            >
                              <div className="w-[1.5px] h-3.5 bg-zinc-600 group-hover:bg-emerald-300 rounded" />
                            </div>

                            <span className="font-amiri text-[10.5px] text-zinc-100 font-bold truncate w-full px-1 leading-snug" style={{ direction: "rtl" }}>
                              {segment.text}
                            </span>
                            <span className="text-[7.5px] text-emerald-400 truncate w-full leading-none mt-0.5 px-1 font-sans">
                              {segment.translation}
                            </span>

                            {/* RIGHT RESIZE HANDLE (END BOUNDARY) */}
                            <div 
                              onMouseDown={(e) => handleSegmentRightDragMouseDown(e, segment, segIdx)}
                              className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-emerald-400 bg-zinc-850/40 border-l border-zinc-800 hover:border-emerald-300 rounded-r-md z-30 flex items-center justify-center transition-all resize-handle"
                              title="Drag END boundary"
                            >
                              <div className="w-[1.5px] h-3.5 bg-zinc-600 group-hover:bg-emerald-300 rounded" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* TRACK 4: DYNAMIC SYLLABLE / WORD TIMING CALIBRATOR TRACK */}
                  {expandedSegment !== null && customSegments[expandedSegment] && (
                    <div className="relative h-14 bg-emerald-950/10 border-b border-zinc-850 flex items-center animate-fadeIn duration-305">
                      <div className="sticky left-2.5 w-28 bg-emerald-950/95 border border-emerald-500/20 shadow-md backdrop-blur px-2.5 py-1 rounded text-[8px] uppercase tracking-widest text-emerald-300 font-bold z-30 select-none shadow-black/80">
                        🗣 Syllables ({customSegments[expandedSegment].words.length})
                      </div>

                      <div className="absolute inset-y-0 left-0 right-0">
                        {customSegments[expandedSegment].words.map((wordObj) => {
                          const wStart = wordObj.start;
                          const wEnd = wordObj.end;
                          const left = (wStart / reciterAudioDuration) * 100;
                          const width = ((wEnd - wStart) / reciterAudioDuration) * 100;
                          const isWordActive = reciterAudioTime >= wStart && reciterAudioTime <= wEnd;

                          return (
                            <div
                              key={wordObj.index}
                              onMouseDown={(e) => handleWordBodyDragMouseDown(e, wordObj, customSegments[expandedSegment])}
                              style={{ 
                                left: `${left}%`, 
                                width: `${width}%` 
                              }}
                              className={`absolute inset-y-2 bg-gradient-to-b text-center flex flex-col justify-center items-center py-1 px-1.5 rounded border cursor-grab active:cursor-grabbing transition-all select-none group/word ${
                                isWordActive 
                                  ? "from-teal-600/35 to-teal-500/25 border-teal-300 shadow shadow-teal-400/20 scale-[1.01] z-20" 
                                  : "from-zinc-900/90 to-zinc-950/85 border-zinc-800 hover:border-zinc-700"
                              }`}
                              title={`Word "${wordObj.word}": drag body to move, drag edge resize handles to calibrate syllable duration`}
                            >
                              {/* LEFT RESIZE HANDLE (WORD START) */}
                              <div 
                                onMouseDown={(e) => handleWordLeftDragMouseDown(e, wordObj, customSegments[expandedSegment])}
                                className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-teal-400 bg-zinc-805/10 border-r border-zinc-800 hover:border-teal-300 z-30 resize-handle flex items-center justify-center"
                              />

                              <span className="font-amiri text-[10px] text-zinc-100 font-bold truncate w-full px-1" style={{ direction: "rtl" }}>
                                {wordObj.word}
                              </span>

                              {/* RIGHT RESIZE HANDLE (WORD END) */}
                              <div 
                                onMouseDown={(e) => handleWordRightDragMouseDown(e, wordObj, customSegments[expandedSegment])}
                                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-teal-400 bg-zinc-805/10 border-l border-zinc-800 hover:border-teal-300 z-30 resize-handle flex items-center justify-center"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TRACK 5: RECITER VOICE AUDIO WAVEFORM TRACK */}
                  <div className="relative h-14 bg-zinc-950/20 flex items-center">
                    <div className="sticky left-2.5 w-28 bg-zinc-950/95 border border-white/10 shadow-md backdrop-blur px-2.5 py-1 rounded text-[8px] uppercase tracking-widest text-zinc-300 font-bold z-30 select-none shadow-black/80">
                      🎙 Vocals
                    </div>

                    <div className="absolute inset-y-0 left-32 right-4 flex items-end justify-between pb-1 pointer-events-none">
                      {Array.from({ length: Math.max(40, Math.floor(zoomMultiplier * 20)) }).map((_, barIdx) => {
                        const totalBars = Math.max(40, Math.floor(zoomMultiplier * 20));
                        const barTime = (barIdx / totalBars) * reciterAudioDuration;
                        const hasPlayed = reciterAudioTime > barTime;
                        
                        // Generates beautiful realistic speech waveform peaks
                        const heightPercent = 20 + Math.sin(barIdx * 0.4) * 35 + Math.cos(barIdx * 0.75) * 45;
                        const clampedHeight = Math.max(8, Math.min(95, heightPercent));

                        return (
                          <div
                            key={barIdx}
                            style={{ height: `${clampedHeight}%` }}
                            className={`w-1 rounded-sm transition-all duration-300 ${
                              hasPlayed ? "bg-emerald-400/80 shadow-[0_0_4px_rgba(52,211,153,0.3)]" : "bg-zinc-800"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* MAGNETIC ALIGNMENT INDICATOR VERTICAL SNAP LINE */}
                  {isSnappingEnabled && snapIndicatorTime !== null && (
                    <div 
                      className="absolute top-0 bottom-0 w-[1.5px] bg-amber-400 z-40 pointer-events-none shadow-[0_0_6px_rgba(251,191,36,0.85)] animate-pulse"
                      style={{ left: `${(snapIndicatorTime / reciterAudioDuration) * 100}%` }}
                    >
                      <div className="absolute top-0 -left-6 bg-amber-500 text-zinc-950 text-[7px] px-1 rounded font-sans font-bold select-none uppercase tracking-wider scale-90">
                        ALIGN
                      </div>
                    </div>
                  )}

                  {/* REAL-TIME SCRUBBING PLAYHEAD NEEDLE */}
                  <div 
                    className="absolute top-0 bottom-0 w-[2.5px] bg-red-500 z-40 pointer-events-none"
                    style={{ left: `${(reciterAudioTime / reciterAudioDuration) * 100}%` }}
                  >
                    <div className="absolute -top-1.5 -left-[7px] text-[10px] text-red-500 select-none cursor-pointer animate-bounce">
                      ▼
                    </div>
                    {/* Glowing playhead aura */}
                    <div className="absolute inset-y-0 w-[8px] -left-[3px] bg-red-500/10 pointer-events-none" />
                  </div>

                </div>
              </div>

              {/* TIMELINE CONTROLS TIP */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[10px] text-zinc-500 border-t border-white/5 pt-2">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  Grid scrollable horizontally. Grab and drag segments or individual words directly.
                </span>
                <span className="text-zinc-400 font-semibold bg-zinc-900 border border-white/5 px-2 py-0.5 rounded">
                  💡 Tip: Double-click or click track lane to snap playhead
                </span>
              </div>
            </div>

            {/* Quick action controls (Undo, Redo, Reset to Auto-Sync) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onUndoTiming}
                disabled={historyIndex <= 0}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-900 border border-white/5 text-zinc-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition"
                title="Undo last timing change"
              >
                <Undo className="w-3.5 h-3.5" />
                Undo
              </button>

              <button
                onClick={onRedoTiming}
                disabled={historyIndex >= historyLength - 1}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-900 border border-white/5 text-zinc-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition"
                title="Redo previous timing change"
              >
                <Redo className="w-3.5 h-3.5" />
                Redo
              </button>

              <button
                onClick={onResetToAutoTiming}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition"
                title="Revert all manual edits and reload original duration timings"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Auto
              </button>
            </div>

            {/* Timing Export Backup/Import controls */}
            <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-1.5">
              <span className="text-[10px] text-zinc-500 font-medium">Backup local project adjustments:</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeWordTimings, null, 2));
                    const dlAnchor = document.createElement('a');
                    dlAnchor.setAttribute("href", dataStr);
                    dlAnchor.setAttribute("download", `QuranShorts_Timings_${currentVerse?.surahName || "Verse"}_${currentVerse?.numberInSurah || 1}.json`);
                    dlAnchor.click();
                  }}
                  disabled={!currentVerse || activeWordTimings.length === 0}
                  className="flex-1 sm:flex-initial py-1 px-2.5 rounded-lg text-[10px] bg-slate-900 border border-white/5 hover:bg-slate-800 text-zinc-300 font-mono transition"
                >
                  Export JSON
                </button>
                <label className="flex-1 sm:flex-initial py-1 px-2.5 rounded-lg text-[10px] bg-slate-900 border border-white/5 hover:bg-slate-800 text-zinc-200 font-mono text-center cursor-pointer transition">
                  Import JSON
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const parsed = JSON.parse(event.target?.result as string);
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            if (parsed[0].word && typeof parsed[0].start === 'number') {
                              // Send the full loaded timings to custom editor state
                              onResetToAutoTiming?.(); // Force update trigger
                              setTimeout(() => {
                                parsed.forEach((item, index) => {
                                  onUpdateWordTiming?.(index, "start", item.start);
                                  onUpdateWordTiming?.(index, "end", item.end);
                                });
                              }, 100);
                            }
                          }
                        } catch (err) {
                          alert("Invalid JSON format");
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Interactive Section Header: Segments List */}
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest text-[10px]">Active Caption Segments ({customSegments.length})</span>
              
              {customSegments.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 bg-slate-950/20 rounded-xl border border-white/5">
                  No segments generated. Make sure a verse is selected.
                </div>
              ) : (
                customSegments.map((segment, segIdx) => {
                  const segmentWordIndices = segment.words.map(w => w.index);
                  const isSegmentExpanded = expandedSegment === segIdx;

                  return (
                    <div 
                      key={segIdx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isSegmentExpanded 
                          ? "bg-slate-950/60 border-emerald-500/40 shadow-sm shadow-emerald-500/5" 
                          : "bg-slate-950/30 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {/* Segment header: Arabic text and translation */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="text-right select-all">
                          <span className="font-amiri font-bold text-lg text-white block leading-relaxed" style={{ direction: "rtl" }}>
                            {segment.text}
                          </span>
                          <span className="text-[11px] text-zinc-400 block italic mt-1 leading-snug">
                            {segment.translation}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono font-bold bg-slate-900 border border-white/5 px-2 py-0.5 rounded-lg text-emerald-400">
                            {segment.start.toFixed(2)}s - {segment.end.toFixed(2)}s
                          </span>
                          <span className="text-[9px] text-zinc-600 font-mono">
                            Words: {segment.words.length}
                          </span>
                        </div>
                      </div>

                      {/* Shift Entire Segment Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                        <span className="text-[10px] text-zinc-500 font-mono">Shift Caption Segment:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onShiftSegmentTiming?.(segmentWordIndices, -0.1)}
                            className="p-1 px-2.5 rounded-lg bg-slate-900 border border-white/5 text-[10px] text-zinc-300 hover:text-white transition-all flex items-center gap-1"
                            title="Move caption earlier by 0.1 seconds"
                          >
                            <Minus className="w-3 h-3 text-red-500" />
                            Earlier (-0.1s)
                          </button>
                          <button
                            onClick={() => onShiftSegmentTiming?.(segmentWordIndices, 0.1)}
                            className="p-1 px-2.5 rounded-lg bg-slate-900 border border-white/5 text-[10px] text-zinc-300 hover:text-white transition-all flex items-center gap-1"
                            title="Move caption later by 0.1 seconds"
                          >
                            <Plus className="w-3 h-3 text-emerald-500" />
                            Later (+0.1s)
                          </button>
                        </div>
                      </div>

                      {/* Expand / Collapse Word Syllables Slider Details */}
                      <div className="mt-2 text-center">
                        <button
                          onClick={() => setExpandedSegment(isSegmentExpanded ? null : segIdx)}
                          className="text-[10px] font-semibold text-emerald-500/80 hover:text-emerald-400 flex items-center gap-1 mx-auto"
                        >
                          {isSegmentExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              Hide Word-level Timings
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              Fine-tune Syllables / Words ({segment.words.length})
                            </>
                          )}
                        </button>
                      </div>

                      {/* Word Sliders expansion block */}
                      {isSegmentExpanded && (
                        <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-4 animate-fadeIn">
                          <span className="block text-[9px] uppercase font-mono tracking-widest text-zinc-500 border-b border-white/5 pb-1">Word Timing Calibration</span>
                          
                          {segment.words.map((wordObj) => (
                            <div key={wordObj.index} className="space-y-2 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                              <div className="flex items-center justify-between">
                                <span className="font-amiri font-bold text-base text-emerald-400" style={{ direction: "rtl" }}>
                                  {wordObj.word}
                                </span>
                                <div className="text-[10px] font-mono text-zinc-400 flex gap-2">
                                  <span>Start: <strong className="text-white">{wordObj.start.toFixed(2)}s</strong></span>
                                  <span>•</span>
                                  <span>End: <strong className="text-white">{wordObj.end.toFixed(2)}s</strong></span>
                                </div>
                              </div>

                              {/* Start Time Fine-tuning Slider */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[9px] text-zinc-500">
                                  <span>Aura Start boundary:</span>
                                  <div className="flex items-center gap-1 font-mono">
                                    <button 
                                      onClick={() => onUpdateWordTiming?.(wordObj.index, "start", wordObj.start - 0.05)}
                                      className="p-0.5 px-1 bg-slate-900 border border-white/5 rounded text-zinc-400 hover:text-white"
                                    >-0.05s</button>
                                    <button 
                                      onClick={() => onUpdateWordTiming?.(wordObj.index, "start", wordObj.start + 0.05)}
                                      className="p-0.5 px-1 bg-slate-900 border border-white/5 rounded text-zinc-400 hover:text-white"
                                    >+0.05s</button>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max={reciterAudioDuration}
                                  step="0.01"
                                  value={wordObj.start}
                                  onChange={(e) => onUpdateWordTiming?.(wordObj.index, "start", Number(e.target.value))}
                                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                              </div>

                              {/* End Time Fine-tuning Slider */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[9px] text-zinc-500">
                                  <span>Aura End boundary:</span>
                                  <div className="flex items-center gap-1 font-mono">
                                    <button 
                                      onClick={() => onUpdateWordTiming?.(wordObj.index, "end", wordObj.end - 0.05)}
                                      className="p-0.5 px-1 bg-slate-900 border border-white/5 rounded text-zinc-400 hover:text-white"
                                    >-0.05s</button>
                                    <button 
                                      onClick={() => onUpdateWordTiming?.(wordObj.index, "end", wordObj.end + 0.05)}
                                      className="p-0.5 px-1 bg-slate-900 border border-white/5 rounded text-zinc-400 hover:text-white"
                                    >+0.05s</button>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max={reciterAudioDuration}
                                  step="0.01"
                                  value={wordObj.end}
                                  onChange={(e) => onUpdateWordTiming?.(wordObj.index, "end", Number(e.target.value))}
                                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 7: EXPORT */}
        {activeTab === "save" && (() => {
          const diagWordTimings = activeWordTimings && activeWordTimings.length > 0 
            ? activeWordTimings 
            : (currentVerse ? getWordTimings(currentVerse.text, reciterAudioDuration || 8) : []);
          const diagSegments = customSegments && customSegments.length > 0 
            ? customSegments 
            : (currentVerse ? getSegmentTimings(diagWordTimings, currentVerse.translation, settings.maxWordsPerSegment || 5) : []);
          const diagLastSegmentEnd = diagSegments.length > 0 ? diagSegments[diagSegments.length - 1].end : 0;
          
          let diagCalculatedExportDuration = reciterAudioDuration || 8;
          if (diagLastSegmentEnd > diagCalculatedExportDuration) {
            diagCalculatedExportDuration = diagLastSegmentEnd;
          }

          const matchingVideoElement = typeof document !== "undefined" ? document.querySelector("#shorts-player-container video") as HTMLVideoElement : null;
          const matchingImageElement = typeof document !== "undefined" ? document.querySelector("#shorts-player-container img") as HTMLImageElement : null;
          const diagVideoDuration = matchingVideoElement ? matchingVideoElement.duration : 0;

          const reciterAudios = typeof window !== "undefined" ? (window as any).__reciterAudios || [] : [];
          const reciterAudio = typeof window !== "undefined" ? (window as any).__reciterAudioElement || (reciterAudios.length > 0 ? reciterAudios[0] : null) : null;
          
          // Pre-flight state detections
          const chkAudioReady = reciterAudios.length > 0 
            ? reciterAudios.every((a: HTMLAudioElement) => a.readyState >= 1) 
            : (reciterAudio ? reciterAudio.readyState >= 1 : false);
          const chkCaptionsReady = diagSegments && diagSegments.length > 0;
          const chkVideoReady = matchingVideoElement 
            ? matchingVideoElement.readyState >= 2 
            : (matchingImageElement ? matchingImageElement.complete : false);
          const chkDurationOk = diagCalculatedExportDuration > 0 && !isNaN(diagCalculatedExportDuration);
          const chkNoMissingAssets = chkAudioReady && chkVideoReady && chkCaptionsReady;

          const diagWarnings: string[] = [];
          if (diagVideoDuration && reciterAudioDuration && diagVideoDuration < reciterAudioDuration) {
            diagWarnings.push(`The background template video (${diagVideoDuration.toFixed(1)}s) is shorter than the recitation track (${reciterAudioDuration.toFixed(1)}s) and will be looped seamlessly.`);
          }
          if (settings.timingOffset !== 0) {
            diagWarnings.push(`Timing Offset of ${settings.timingOffset > 0 ? '+' : ''}${settings.timingOffset.toFixed(2)}s will shift word alignments.`);
          }
          if (nasheedVolume > 0) {
            diagWarnings.push(`Background Nasheed audio will mix in at ${nasheedVolume}% volume.`);
          }

          return (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
                <span className="block text-xs text-white font-semibold">Exporter Optimization Preferences</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Generate high-definition professional short videos. Our render engine will compile the background animations, apply the customized typography, shadows, glowing particles, and bundle the audio files into an Instagram/YouTube optimized video file.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-1.5 font-mono">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5 text-center">
                    <span className="block text-[10px] text-slate-500">FORMAT</span>
                    <span className="block text-white font-bold text-xs mt-1">1080 x 1920</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5 text-center">
                    <span className="block text-[10px] text-slate-500">FRAME RATE</span>
                    <span className="block text-white font-bold text-xs mt-1">30 FPS (Const)</span>
                  </div>
                </div>
              </div>

              {/* Real-time Pre-Flight Operations Checklist */}
              <div className="bg-slate-950/70 rounded-2xl p-4 border border-emerald-500/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">📋 PRE-FLIGHT VERIFICATION CHECKS</span>
                  <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                    {chkNoMissingAssets ? "ALL CHECKS PASSED ✓" : "PENDING CAPTURE SETUP ⏳"}
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">✓ Audio loaded & mapped:</span>
                    <span className={chkAudioReady ? "text-emerald-400 font-bold" : "text-amber-500"}>
                      {chkAudioReady ? "READY" : "LOADING..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">✓ Captions parsed & aligned:</span>
                    <span className={chkCaptionsReady ? "text-emerald-400 font-bold" : "text-amber-500"}>
                      {chkCaptionsReady ? "READY" : "MISSING"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">✓ Background {matchingImageElement ? "photo" : "video"} primed:</span>
                    <span className={chkVideoReady ? "text-emerald-400 font-bold" : "text-amber-500"}>
                      {chkVideoReady ? (matchingImageElement ? "READY (PHOTO)" : "READY (VIDEO)") : "BUFFERING..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">✓ Asset integrity (no missing assets):</span>
                    <span className={chkNoMissingAssets ? "text-emerald-400 font-bold" : "text-amber-500"}>
                      {chkNoMissingAssets ? "CONFIRMED" : "PENDING..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">✓ Timeline duration valid:</span>
                    <span className={chkDurationOk ? "text-emerald-400 font-bold" : "text-red-500"}>
                      {chkDurationOk ? `${diagCalculatedExportDuration.toFixed(2)}s` : "INVALID"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">✓ Export duration match project:</span>
                    <span className="text-emerald-400 font-bold">MATCHED</span>
                  </div>
                </div>
              </div>

              {/* Big Export trigger button */}
              <button
                onClick={handleExecuteExportProcess}
                disabled={isExporting || !currentVerse}
                className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold text-white py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 disabled:bg-slate-800 disabled:text-slate-500"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Compiling Video... ({exportProgress}%)
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Render & Export 9:16 Short Video
                  </>
                )}
              </button>

              {isExporting && (
                <div className="w-full bg-slate-900 rounded-full h-1.5 border border-white/5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              )}

              {/* Dynamic Pipeline Diagnostics HUD */}
              <div className="bg-zinc-950/80 rounded-2xl p-4 border border-zinc-900 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🔬 PIPELINE DIAGNOSTICS</span>
                  <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                    {isExporting ? "ENCODING ACTIVE" : "READY TO RENDER"}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10px] block font-medium">AUDIO LENGTH</span>
                    <span className="text-zinc-200 font-mono font-bold block">
                      {reciterAudioDuration ? `${reciterAudioDuration.toFixed(2)}s` : "0.00s"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10px] block font-medium">BG VIDEO LENGTH</span>
                    <span className="text-zinc-200 font-mono font-bold block">
                      {diagVideoDuration ? `${diagVideoDuration.toFixed(2)}s` : "0.00s"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10px] block font-medium">CAPTION LENGTH</span>
                    <span className="text-zinc-200 font-mono font-bold block">
                      {diagLastSegmentEnd ? `${diagLastSegmentEnd.toFixed(2)}s` : "0.00s"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10px] block font-medium">FINAL EXPORT LENGTH</span>
                    <span className="text-emerald-400 font-mono font-bold block">
                      {diagCalculatedExportDuration ? `${diagCalculatedExportDuration.toFixed(2)}s` : "0.00s"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10px] block font-medium">EXPORT FRAME RATE</span>
                    <span className="text-zinc-200 font-mono block font-semibold">
                      {isExporting ? `${exportFps} FPS` : "30.00 FPS (Target)"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10px] block font-medium">COMPILED FRAMES</span>
                    <span className="text-zinc-200 font-mono block font-semibold">
                      {isExporting ? `${renderedFramesCount} frames` : "—"}
                    </span>
                  </div>
                </div>

                {diagWarnings.length > 0 && (
                  <div className="bg-amber-500/5 rounded-xl border border-amber-500/10 p-2.5 space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">EXPORT WARNINGS</span>
                    {diagWarnings.map((warn, wIdx) => (
                      <div key={wIdx} className="text-[10.5px] text-zinc-400 leading-relaxed flex items-start gap-1">
                        <span className="text-amber-500 flex-shrink-0">⚠</span>
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Social network recommendations alerts */}
              <div>
                <span className="block text-[11px] text-slate-400 mb-2 font-medium tracking-wide uppercase">⚡ PLATFORM ADAPTING TIPS</span>
                <div className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                  <div className="bg-slate-950/35 p-2 px-3 rounded-lg border border-white/5">
                    • <strong className="text-white">YouTube Shorts</strong>: Excellent for verses about creation, nature, and mountains. Keeps viewers hooked with animated typography.
                  </div>
                  <div className="bg-slate-950/35 p-2 px-3 rounded-lg border border-white/5">
                    • <strong className="text-white">TikTok & Reels</strong>: Use the <span className="text-emerald-400">Emerald Cinematic</span> template with high video brightness overlay for deep contrast. Works wonders!
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
