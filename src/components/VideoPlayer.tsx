import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { VerseData, VideoEditorSettings, BackgroundVideo, SelectedVerseInfo } from "../types";
import { Play, Pause, RefreshCw, Volume2, VolumeX, Maximize2, AlertCircle, Rewind, FastForward } from "lucide-react";
import { getWordTimings, getSegmentTimings, findActiveTiming, WordTiming, SegmentTiming, findActiveVerse } from "../utils/captionHelper";

interface VideoPlayerProps {
  verse: VerseData | null;
  selectedVerses?: SelectedVerseInfo[];
  settings: VideoEditorSettings;
  setSettings: (updater: (prev: VideoEditorSettings) => VideoEditorSettings) => void;
  selectedVideo: BackgroundVideo;
  uploadedVideoUrl: string | null;
  uploadedImageUrl?: string | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  selectedReciterName: string;
  isAiLoading: boolean;
  aestheticTitle: string;
  reflectionPrompt: string;
  reciterAudioTime: number;
  reciterAudioDuration: number;
  isReciterPlaying: boolean;
  toggleReciterVoice: () => void;
  reciterError: string;
  activeWordTimings?: WordTiming[];
  customSegments?: SegmentTiming[];
  onSeekAudio?: (time: number) => void;
}

export default function VideoPlayer({
  verse,
  selectedVerses = [],
  settings,
  setSettings,
  selectedVideo,
  uploadedVideoUrl,
  uploadedImageUrl = null,
  isPlaying,
  setIsPlaying,
  selectedReciterName,
  isAiLoading,
  aestheticTitle,
  reflectionPrompt,
  reciterAudioTime,
  reciterAudioDuration,
  isReciterPlaying,
  toggleReciterVoice,
  reciterError,
  activeWordTimings = [],
  customSegments = [],
  onSeekAudio,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Sync video play/pause state and align with master audio clock timeline
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Play/Pause state synchronization (self-healing)
    if (isPlaying) {
      if (video.paused) {
        video.play().catch((err) => {
          console.warn("Video failed to play: ", err);
        });
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }

    // 2. Playhead / Seek / Drift synchronization (self-healing within 0.25 seconds)
    const duration = video.duration;
    if (duration && duration > 0) {
      const targetTime = reciterAudioTime % duration;
      const diff = Math.abs(video.currentTime - targetTime);
      // If it drifts by more than 0.25 seconds, instantly force-align it
      if (diff > 0.25) {
        video.currentTime = targetTime;
      }
    }
  }, [isPlaying, reciterAudioTime, selectedVideo, uploadedVideoUrl]);

  // Handle Dragging of the Text overlay inside the 9:16 container
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const relativeY = moveEvent.clientY - containerRect.top;
      let percentageY = (relativeY / containerRect.height) * 100;
      // Clamp between 10% and 90%
      percentageY = Math.max(10, Math.min(90, percentageY));
      
      setSettings((prev) => ({
        ...prev,
        textPosition: Math.round(percentageY),
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsTouchDragging(true);
    const containerRect = containerRef.current.getBoundingClientRect();

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const touch = moveEvent.touches[0];
      const relativeY = touch.clientY - containerRect.top;
      let percentageY = (relativeY / containerRect.height) * 100;
      percentageY = Math.max(10, Math.min(90, percentageY));
      
      setSettings((prev) => ({
        ...prev,
        textPosition: Math.round(percentageY),
      }));
    };

    const handleTouchEnd = () => {
      setIsTouchDragging(false);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Skip back/forward and scrubbing helpers
  const handleSkipBackward = () => {
    if (!onSeekAudio) return;
    onSeekAudio(Math.max(0, reciterAudioTime - 2));
  };

  const handleSkipForward = () => {
    if (!onSeekAudio || !reciterAudioDuration) return;
    onSeekAudio(Math.min(reciterAudioDuration, reciterAudioTime + 2));
  };

  const handleScrubberMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeekAudio || !reciterAudioDuration || reciterAudioDuration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    
    const handleMove = (moveEv: MouseEvent) => {
      const relativeX = moveEv.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, relativeX / rect.width));
      onSeekAudio(pct * reciterAudioDuration);
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    
    const initialPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeekAudio(initialPct * reciterAudioDuration);
  };

  const handleScrubberTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!onSeekAudio || !reciterAudioDuration || reciterAudioDuration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();

    const handleTouchMove = (moveEv: TouchEvent) => {
      if (moveEv.touches.length === 0) return;
      const t = moveEv.touches[0];
      const relativeX = t.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, relativeX / rect.width));
      onSeekAudio(pct * reciterAudioDuration);
    };

    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    if (e.touches.length > 0) {
      const initialPct = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
      onSeekAudio(initialPct * reciterAudioDuration);
    }
  };

  // Word level segmentation and timing parsing
  const wordTimings = activeWordTimings && activeWordTimings.length > 0 
    ? activeWordTimings 
    : (verse ? getWordTimings(verse.text, reciterAudioDuration) : []);
  const segments = customSegments && customSegments.length > 0 
    ? customSegments 
    : (verse ? getSegmentTimings(wordTimings, verse.translation, settings.maxWordsPerSegment || 5) : []);
  
  // Apply visual progress offset (seconds delay/advance adjustment)
  const adjustedTime = Math.max(0, Math.min(reciterAudioDuration, reciterAudioTime + (settings.timingOffset || 0)));
  const { activeSegment, activeWord } = findActiveTiming(segments, adjustedTime);

  const activeVerseInfo = selectedVerses && selectedVerses.length > 0
    ? findActiveVerse(selectedVerses, adjustedTime)
    : null;
  const activeVerse = activeVerseInfo ? activeVerseInfo.verse : verse;

  // Convert settings to CSS Styles for canvas text rendering likeness
  const quranTextStyle: React.CSSProperties = {
    color: settings.textColor,
    fontSize: `${settings.fontSize}px`,
    textAlign: settings.alignment as any,
    lineHeight: 1.8,
    textShadow: settings.textShadowColor 
      ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}` 
      : "none",
    boxShadow: settings.textGlowColor && settings.textGlowBlur > 0
      ? `0 0 ${settings.textGlowBlur * 2}px ${settings.textGlowColor}`
      : "none",
    filter: settings.textGlowColor && settings.textGlowBlur > 0
      ? `drop-shadow(0 0 ${settings.textGlowBlur}px ${settings.textGlowColor})`
      : "none",
  };

  const translationTextStyle: React.CSSProperties = {
    color: settings.translationColor,
    fontSize: `${settings.translationFontSize}px`,
    textAlign: settings.alignment as any,
    lineHeight: 1.4,
    textShadow: "0 2px 4px rgba(0,0,0,0.8)",
    fontFamily: settings.translationFontName ? `"${settings.translationFontName}", ${settings.translationFontName === "Montserrat" || settings.translationFontName === "Inter" ? "sans-serif" : "serif"}` : undefined,
  };

  const getEnglishFontFamilyClass = () => {
    switch (settings.translationFontName) {
      case "Lora":
        return "font-lora";
      case "Playfair Display":
        return "font-playfair font-medium";
      case "Cinzel":
        return "font-cinzel tracking-wider uppercase font-semibold";
      case "Cormorant Garamond":
        return "font-cormorant italic font-medium";
      case "Montserrat":
        return "font-montserrat tracking-tight";
      default:
        return "font-sans font-light";
    }
  };

  // Motion animation presets
  const getMotionAnimation = () => {
    switch (settings.animationType) {
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.8 },
        };
      case "zoom":
        return {
          initial: { opacity: 0, scale: 0.85 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.85 },
          transition: { type: "spring", stiffness: 100, damping: 20 },
        };
      case "slide":
        return {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -30 },
          transition: { type: "spring", stiffness: 120, damping: 15 },
        };
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
        };
    }
  };

  const getFontFamilyClass = () => {
    switch (settings.fontName) {
      case "Amiri":
        return "font-amiri";
      case "Scheherazade New":
        return "font-scheherazade";
      case "Reem Kufi":
        return "font-kufi";
      default:
        return "font-sans";
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* 9:16 Vertical Video Frame */}
      <div
        id="shorts-player-container"
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-[40px] overflow-hidden shadow-2xl ring-4 ring-white/5 border-8 border-zinc-900 flex flex-col justify-start group transition-all hover:border-zinc-800"
      >
        {/* Underlay filter for adjusting video brightness and contrast */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 bg-black"
          style={{ opacity: `${(100 - settings.videoOpacity) / 100}` }}
        />

        {/* Photo or Video Backdrop Medium */}
        {uploadedImageUrl ? (
          <img
            src={uploadedImageUrl}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300 pointer-events-none"
            style={{
              filter: `brightness(${settings.videoBrightness / 50})`,
            }}
          />
        ) : (
          <video
            ref={videoRef}
            src={uploadedVideoUrl || selectedVideo.url}
            key={uploadedVideoUrl || selectedVideo.url}
            loop
            muted={isMuted}
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300 pointer-events-none"
            style={{
              filter: `brightness(${settings.videoBrightness / 50})`,
            }}
          />
        )}

        {/* AI Loading Mask */}
        {isAiLoading && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-30">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="text-emerald-500 mb-4"
            >
              <RefreshCw className="w-10 h-10" />
            </motion.div>
            <p className="text-white font-bold text-sm tracking-wide">AI INTELLECT ENGAGED</p>
            <p className="text-zinc-500 text-xs mt-1 max-w-[220px]">Analyzing scriptures to compose dynamic typographic elements...</p>
          </div>
        )}

        {/* Header / Aesthetic title overlay */}
        <div className="absolute top-6 left-0 right-0 z-20 px-4 text-center pointer-events-none">
          {aestheticTitle ? (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-400 font-kufi tracking-widest text-[10px] uppercase font-bold px-3 py-1 bg-black/70 rounded-full border border-emerald-500/25 backdrop-blur-sm shadow-md inline-block max-w-[250px] truncate"
            >
              ⚜️ {aestheticTitle}
            </motion.span>
          ) : (
            <span className="text-zinc-500 font-sans tracking-widest text-[9px] uppercase font-bold">
              • QURAN SHORTS MAKER •
            </span>
          )}
        </div>

        {/* DRAGGABLE TEXT GRAPHICS LAYER */}
        <div
          ref={dragContainerRef}
          className={`absolute inset-0 z-20 flex flex-col justify-start pointer-events-auto select-none px-6 cursor-ns-resize ${
            isTouchDragging ? "active:scale-98" : ""
          }`}
          style={{
            paddingTop: `${settings.textPosition}%`,
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {activeVerse && (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${activeVerse.surahNumber}-${activeVerse.numberInSurah}-${activeSegment ? activeSegment.index : "all"}-${settings.animationType}`}
                {...getMotionAnimation()}
                className="w-full flex flex-col space-y-4 bg-black/35 backdrop-blur-[2px] p-4 rounded-2xl border border-white/5 transition-colors group-hover:border-white/10 group-hover:bg-black/50"
              >
                {/* Uthmani Quran Text / Word Level Caption System */}
                {activeSegment ? (
                  <div
                    className="flex flex-wrap justify-center items-center gap-y-2 w-full select-none"
                    style={{
                      direction: "rtl",
                    }}
                  >
                    {activeSegment.words.map((wordObj) => {
                      const isWordActive = activeWord && activeWord.index === wordObj.index;
                      return (
                        <motion.span
                          key={wordObj.index}
                          className={`transition-all duration-300 font-bold ${getFontFamilyClass()}`}
                          style={{
                            color: isWordActive ? "#10b981" : settings.textColor,
                            fontSize: `${settings.fontSize}px`,
                            textShadow: isWordActive
                              ? `0 0 ${settings.textGlowBlur + 10}px ${settings.textGlowColor || "rgba(16, 185, 129, 0.8)"}`
                              : settings.textShadowColor
                              ? `0 0 ${settings.textShadowBlur}px ${settings.textShadowColor}`
                              : "none",
                            lineHeight: 1.8,
                            display: "inline-block",
                            margin: `0 ${settings.wordSpacing}px`,
                          }}
                          animate={isWordActive ? { scale: [1, 1.12, 1.05] } : { scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {wordObj.word}
                        </motion.span>
                      );
                    })}
                  </div>
                ) : (
                  <span
                    style={quranTextStyle}
                    className={`quran-uthmani ${getFontFamilyClass()} block select-none break-words tracking-normal leading-relaxed`}
                  >
                    {activeVerse.text}
                  </span>
                )}

                {/* Translation Line */}
                {settings.showTranslation && (
                  <span
                    style={translationTextStyle}
                    className={`block text-center select-none break-words text-slate-200 mt-2 transition-opacity duration-300 ${getEnglishFontFamilyClass()}`}
                  >
                    {activeSegment ? activeSegment.translation : activeVerse.translation}
                  </span>
                )}

                {/* Surah and Ayah Tag */}
                {settings.showSurahLabel && (
                  <div
                    style={{ color: settings.surahLabelColor }}
                    className="text-[10px] uppercase font-mono tracking-widest text-center mt-3 opacity-90 font-semibold"
                  >
                    — Surat {activeVerse.surahName} : {activeVerse.numberInSurah} —
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Placeholder when no verse selected */}
          {!activeVerse && (
            <div className="text-center bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/5 mx-auto">
              <p className="text-white text-xs font-semibold">No Verse Loaded</p>
              <p className="text-slate-400 text-[10px] mt-1">Search or Select any Surah first</p>
            </div>
          )}
        </div>

        {/* Footer reflective label overlay */}
        {reflectionPrompt && (
          <div className="absolute bottom-6 left-0 right-0 z-20 px-6 text-center pointer-events-none">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              style={{
                fontFamily: settings.translationFontName ? `"${settings.translationFontName}", ${settings.translationFontName === "Montserrat" || settings.translationFontName === "Inter" ? "sans-serif" : "serif"}` : undefined,
              }}
              className={`text-white/85 text-[10.5px] leading-snug px-3 py-2 bg-black/55 backdrop-blur-md rounded-xl border border-white/5 shadow-lg ${getEnglishFontFamilyClass()}`}
            >
              "{reflectionPrompt}"
            </motion.p>
          </div>
        )}

        {/* Ambient Premium Playback Controller HUD overlay */}
        <div 
          className={`absolute inset-x-3 bottom-14 z-25 flex flex-col gap-1.5 p-2.5 rounded-2xl bg-zinc-950/90 backdrop-blur-md border border-white/10 transition-opacity duration-300 pointer-events-auto ${
            (!isPlaying || isHovered || isTouchDragging) ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Custom Interactive Scrubber / Timeline Slider */}
          <div 
            title="Drag or click to move around video"
            className="w-full h-4 flex items-center cursor-pointer group/scrub"
            onMouseDown={handleScrubberMouseDown}
            onTouchStart={handleScrubberTouchStart}
          >
            <div className="w-full h-1 bg-white/20 rounded-full relative overflow-visible">
              {/* Progress Fill */}
              <div 
                className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                style={{ width: `${Math.min(100, Math.max(0, (reciterAudioTime / (reciterAudioDuration || 1)) * 100))}%` }}
              />
              {/* Active Knob */}
              <div 
                className="absolute w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-[4px] border border-emerald-600 shadow-md group-hover/scrub:scale-125 transition-transform"
                style={{ left: `${Math.min(100, Math.max(0, (reciterAudioTime / (reciterAudioDuration || 1)) * 100))}%` }}
              />
            </div>
          </div>

          {/* Controls Bar & Playback Labels */}
          <div className="flex items-center justify-between">
            {/* Playhead Time */}
            <span className="font-mono text-[9px] text-zinc-300 font-semibold tracking-tight">
              {formatTime(reciterAudioTime)} <span className="opacity-40">/</span> {formatTime(reciterAudioDuration)}
            </span>

            {/* Core Playback Buttons */}
            <div className="flex items-center gap-3">
              {/* Skip Back 2s */}
              <button
                onClick={handleSkipBackward}
                title="Rewind 2s"
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90 transition"
              >
                <Rewind className="w-3.5 h-3.5" />
              </button>

              {/* Start / Stop (Play/Pause) */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? "Pause Recitation & Loop" : "Play Recitation & Loop"}
                className="p-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 transition"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-white" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
              </button>

              {/* Skip Forward 2s */}
              <button
                onClick={handleSkipForward}
                title="Forward 2s"
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90 transition"
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mute Loop Video */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute Video Background" : "Mute Video Background"}
              className={`p-1 rounded-md transition duration-200 ${
                !isMuted 
                  ? "text-emerald-400 bg-emerald-500/10" 
                  : "text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Frame drag handle guideline */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-1 pointer-events-none select-none opacity-40 group-hover:opacity-80 transition-opacity">
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
          <div className="w-1 h-3 rounded-full bg-white animate-bounce" />
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
        </div>

        {/* Reciter Error Overlay Banner if any */}
        {reciterError && (
          <div className="absolute top-16 left-4 right-4 z-30 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md text-[10px] text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{reciterError}</span>
          </div>
        )}

        {/* Dynamic Interactive Timeline Progress Indicator */}
        <div 
          onMouseDown={handleScrubberMouseDown}
          onTouchStart={handleScrubberTouchStart}
          title="Click or drag to seek"
          className="absolute bottom-0 inset-x-0 h-1.5 bg-white/5 z-28 overflow-hidden cursor-pointer hover:h-2.5 transition-all"
        >
          <div 
            className="bg-emerald-500 h-full transition-all duration-100 shadow-[0_0_10px_rgba(16,185,129,0.9)] pointer-events-none"
            style={{ width: `${Math.min(100, Math.max(0, (reciterAudioTime / (reciterAudioDuration || 1)) * 100))}%` }}
          />
        </div>
      </div>

      {/* Control Label Below Player */}
      <div className="mt-3 text-center">
        <span className="text-xs text-zinc-500 flex items-center justify-center gap-1.5 font-mono">
          <Maximize2 className="w-3 h-3 text-emerald-400" />
          Drag text directly inside player to position vertically
        </span>
      </div>
    </div>
  );
}
