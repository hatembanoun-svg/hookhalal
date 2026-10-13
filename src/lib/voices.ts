export type Voice = { id: string; lang: string; flag: string; label: string; labelAr: string };

export const VOICES: Voice[] = [
  { id: "ar-DZ-IsmaelNeural", lang: "ar-DZ", flag: "🇩🇿", label: "Arabic DZ · Male", labelAr: "عربي جزائري · رجل" },
  { id: "ar-SA-ZariyahNeural", lang: "ar-SA", flag: "🇸🇦", label: "Arabic SA · Female", labelAr: "عربي سعودي · امرأة" },
  { id: "ar-EG-ShakirNeural", lang: "ar-EG", flag: "🇪🇬", label: "Arabic EG · Male", labelAr: "عربي مصري · رجل" },
  { id: "en-US-GuyNeural", lang: "en-US", flag: "🇺🇸", label: "English US · Male", labelAr: "إنجليزي · رجل" },
  { id: "en-US-JennyNeural", lang: "en-US", flag: "🇺🇸", label: "English US · Female", labelAr: "إنجليزي · امرأة" },
  { id: "fr-FR-HenriNeural", lang: "fr-FR", flag: "🇫🇷", label: "French · Male", labelAr: "فرنسي · رجل" },
  { id: "fr-CA-AntoineNeural", lang: "fr-CA", flag: "🇨🇦", label: "French CA · Male", labelAr: "فرنسي كندي · رجل" },
];

export const DEFAULT_VOICE = "ar-DZ-IsmaelNeural";
export const findVoice = (id: string) => VOICES.find((v) => v.id === id);
