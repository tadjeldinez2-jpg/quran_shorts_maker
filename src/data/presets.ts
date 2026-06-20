import { BackgroundVideo, TemplatePreset, Reciter } from "../types";

export const BACKGROUND_VIDEOS: BackgroundVideo[] = [
  {
    id: "clouds-sunset",
    name: "Golden Sunset Clouds",
    category: "clouds",
    url: "https://assets.mixkit.co/videos/preview/mixkit-clouds-moving-fast-under-a-blue-sky-40294-large.mp4"
  },
  {
    id: "rain-window",
    name: "Calm Rain Drops",
    category: "rain",
    url: "https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-window-pane-shining-with-lights-40019-large.mp4"
  },
  {
    id: "ocean-aerial",
    name: "Deep Ocean Waves",
    category: "ocean",
    url: "https://assets.mixkit.co/videos/preview/mixkit-top-view-of-waves-crashing-on-a-sandy-beach-41662-large.mp4"
  },
  {
    id: "mountain-aerial",
    name: "Epic Snowy Peaks",
    category: "mountains",
    url: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-snowy-mountain-peaks-shining-in-the-sun-41908-large.mp4"
  },
  {
    id: "forest-sunbeams",
    name: "Sunbeams in Lush Forest",
    category: "forests",
    url: "https://assets.mixkit.co/videos/preview/mixkit-beautiful-aerial-view-of-a-dense-forest-and-mountains-41712-large.mp4"
  },
  {
    id: "mosque-illumination",
    name: "Islamic Geometric Lights",
    category: "mosques",
    url: "https://player.vimeo.com/external/494191417.sd.mp4?s=d70fa72702580a65c929848aeae53b92d6e3bf8e&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: "cinematic-particles",
    name: "Sufi Particle Dust",
    category: "particles",
    url: "https://player.vimeo.com/external/371433846.sd.mp4?s=23ec2dbe34d5216d330fd0b3815e9e0ff9f91195&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: "abstract-sparkles",
    name: "Golden Sparkles Dust",
    category: "abstract",
    url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-gold-particles-floating-in-the-dark-42838-large.mp4"
  }
];

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "golden-islamic",
    name: "Golden Islamic",
    fontName: "Amiri",
    fontColor: "#F3C65F", // Majestic gold
    fontSize: 32,
    alignment: "center",
    shadowColor: "rgba(0, 0, 0, 0.9)",
    shadowBlur: 12,
    glowColor: "#D4AF37",
    glowRadius: 4,
    videoBrightness: 25,
    videoOpacity: 90,
    bgVideoId: "mosque-illumination",
    lineHeight: 2.2,
    letterSpacing: "wide",
    themeColor: "#b45309",
    animationType: "zoom",
    enableKenBurns: true
  },
  {
    id: "emerald-islamic",
    name: "Deep Emerald",
    fontName: "Amiri",
    fontColor: "#FFFFFF",
    fontSize: 32,
    alignment: "center",
    shadowColor: "rgba(0, 0, 0, 0.95)",
    shadowBlur: 14,
    glowColor: "#10B981", // Rich emerald glow
    glowRadius: 8,
    videoBrightness: 20,
    videoOpacity: 95,
    bgVideoId: "mosque-illumination",
    lineHeight: 2.2,
    letterSpacing: "wide",
    themeColor: "#10B981",
    animationType: "fade",
    enableKenBurns: false
  },
  {
    id: "mystical-particles",
    name: "Sufi Amber",
    fontName: "Amiri",
    fontColor: "#FFC107", // Glowing amber
    fontSize: 32,
    alignment: "center",
    shadowColor: "rgba(0, 0, 0, 0.9)",
    shadowBlur: 10,
    glowColor: "#FF8F00", // Soft amber dust glow
    glowRadius: 6,
    videoBrightness: 25,
    videoOpacity: 90,
    bgVideoId: "cinematic-particles",
    lineHeight: 2.2,
    letterSpacing: "normal",
    themeColor: "#d97706",
    animationType: "zoom",
    enableKenBurns: true
  },
  {
    id: "sapphire-night",
    name: "Sapphire Night",
    fontName: "Amiri",
    fontColor: "#E2E8F0", // Cool silver-white
    fontSize: 32,
    alignment: "center",
    shadowColor: "rgba(0, 0, 0, 0.95)",
    shadowBlur: 15,
    glowColor: "#2563EB", // Deep royal blue glow
    glowRadius: 8,
    videoBrightness: 18,
    videoOpacity: 95,
    bgVideoId: "mosque-illumination",
    lineHeight: 2.2,
    letterSpacing: "wide",
    themeColor: "#1d4ed8",
    animationType: "slide",
    enableKenBurns: false
  },
  {
    id: "crystal-minimal",
    name: "Cosmic Charcoal",
    fontName: "Amiri",
    fontColor: "#F3C65F", // Pure gold text
    fontSize: 34,
    alignment: "center",
    shadowColor: "rgba(0, 0, 0, 1.0)",
    shadowBlur: 12,
    glowColor: "rgba(243, 198, 95, 0.35)", // Subtle gold aura
    glowRadius: 4,
    videoBrightness: 15,
    videoOpacity: 95,
    bgVideoId: "cinematic-particles",
    lineHeight: 2.2,
    letterSpacing: "normal",
    themeColor: "#1e293b",
    animationType: "fade",
    enableKenBurns: true
  }
];

export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Al-Afasy",
    avatarLetter: "M",
    identifier: "ar.alafasy"
  },
  {
    id: "alijaber",
    name: "Ali Jaber (علي جابر)",
    avatarLetter: "ج",
    identifier: "ar.alijaber"
  },
  {
    id: "minshawi",
    name: "Muhammad Siddiq al-Minshawi (المنشاوي)",
    avatarLetter: "م",
    identifier: "ar.minshawi"
  },
  {
    id: "hussary",
    name: "Mahmoud Khalil Al-Hussary (الحصري)",
    avatarLetter: "ح",
    identifier: "ar.husary"
  },
  {
    id: "abdulbasit",
    name: "Abdul Basit (Murattal)",
    avatarLetter: "ب",
    identifier: "ar.abdulsamad"
  },
  {
    id: "almuaiqly",
    name: "Maher Al-Muaiqly",
    avatarLetter: "ه",
    identifier: "ar.maheralmuaiqly"
  },
  {
    id: "dussary",
    name: "Yasser Al-Dossari (ياسر الدوسري)",
    avatarLetter: "ي",
    identifier: "ar.yasseraddussary"
  },
  {
    id: "luhaidan",
    name: "Muhammad Al-Luhaidan (محمد اللحيدان)",
    avatarLetter: "ل",
    identifier: "ar.muhammadluhaidan"
  },
  {
    id: "ayyoub",
    name: "Muhammad Ayyub (محمد أيوب)",
    avatarLetter: "أ",
    identifier: "ar.muhammadayyoub"
  }
];
