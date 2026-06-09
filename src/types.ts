export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface VerseData {
  numberInSurah: number;
  text: string; // Uthmani script
  translation: string; // English translation
  audio: string; // URL to mp3 audio stream
  audioSecondary?: string[]; // fallback reciters streams
  surahName: string;
  surahNumber: number;
  absoluteAyahIndex: number;
}

export interface TemplatePreset {
  id: string;
  name: string;
  fontName: string;
  fontColor: string;
  fontSize: number;
  alignment: "left" | "center" | "right";
  shadowColor: string;
  shadowBlur: number;
  glowColor: string;
  glowRadius: number;
  videoBrightness: number; // 0 to 100
  videoOpacity: number; // 0 to 100
  bgVideoId: string;
  lineHeight: number;
  letterSpacing: string;
  themeColor: string; // for UI indicator
  animationType: "fade" | "zoom" | "slide" | "none";
  englishFont?: string; // Optional custom English subtitle font
}

export interface BackgroundVideo {
  id: string;
  name: string;
  category: "nature" | "clouds" | "rain" | "ocean" | "mountains" | "forests" | "mosques" | "particles" | "abstract" | "uploaded";
  url: string;
}

export interface Reciter {
  id: string;
  name: string;
  avatarLetter: string;
  identifier: string; // alquran.cloud identifier
}

export interface VideoEditorSettings {
  textPosition: number; // 0 to 100 (vertical percentage offset)
  textRightOffset: number; // percentage horizontal offset
  fontSize: number; // px for canvas rendering
  fontName: string; // e.g. 'Amiri', 'Scheherazade New', 'system-ui'
  alignment: "left" | "center" | "right";
  textColor: string;
  textShadowColor: string;
  textShadowBlur: number;
  textGlowColor: string;
  textGlowBlur: number;
  videoBrightness: number; // 0 to 100
  videoOpacity: number; // 0 to 100
  animationType: "fade" | "zoom" | "slide" | "none";
  showTranslation: boolean;
  translationColor: string;
  translationFontSize: number;
  translationFontName: string; // New: English translation font styling name
  surahLabelColor: string;
  showSurahLabel: boolean;
  wordSpacing: number; // spacing settings
  maxWordsPerSegment: number; // max words per caption segment
  timingOffset: number; // timing offset in seconds
  playBismillahPrefix: boolean; // whether to automatically prepend Bismillah audio-verbal narration
  enableKenBurns: boolean; // New: toggle transition zoom/pan effect on photo background
}

export interface SelectedVerseInfo {
  verse: VerseData;
  duration: number;
  audioUrl: string;
}

