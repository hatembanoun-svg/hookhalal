// Halal compliance helpers: keyword blocking + enforced "no face / no music" prompts.

const HARAM_TERMS = [
  // English
  "alcohol", "beer", "wine", "vodka", "whisky", "whiskey", "liquor", "cocktail",
  "gambling", "casino", "betting", "poker", "lottery", "porn", "pork", "bacon",
  "cigarette", "cigarettes", "tobacco", "vape", "dating app",
  // French
  "alcool", "vin", "biere", "bière", "jeu d'argent", "paris sportifs", "porc", "tabac",
  // Arabic
  "كحول", "خمر", "خمور", "نبيذ", "بيرة", "ويسكي", "قمار", "مراهنات", "كازينو", "ميسر",
  "يانصيب", "خنزير", "سجائر", "سيجارة", "تبغ", "شيشة", "اباحي", "إباحي",
];

const isArabic = (s: string) => /[\u0600-\u06FF]/.test(s);

export function findHaramTerm(text: string): string | null {
  const t = text.toLowerCase();
  for (const term of HARAM_TERMS) {
    if (isArabic(term)) {
      if (t.includes(term)) return term;
    } else {
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`(^|[^a-zà-ÿ])${esc}([^a-zà-ÿ]|$)`, "i").test(t)) return term;
    }
  }
  return null;
}

const HALAL_SUFFIX =
  "POV hands only, product on table, no face, no person, no people, 9:16 vertical, cinematic close-up, shallow depth of field, silent, no music, no text";
const FREE_SUFFIX = "9:16 vertical, cinematic close-up, silent, no music, no text";

export const NEGATIVE_PROMPT_HALAL =
  "face, faces, person, people, human, portrait, selfie, text, subtitles, watermark, music, lyrics, blurry, low quality";
export const NEGATIVE_PROMPT = "text, subtitles, watermark, music, lyrics, blurry, low quality";

/** Never trust LLM output: strip people-words, then append the enforced suffix. */
export function buildSafePrompt(raw: string, halal: boolean): string {
  let p = (raw || "").replace(/\b(no|without)\s+(face|faces|person|people|music|text)\b/gi, "");
  if (halal) {
    p = p.replace(
      /\b(face|faces|person|people|man|woman|girl|boy|model|portrait|selfie|human|child|kid|crowd)\b/gi,
      ""
    );
  }
  p = p.replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").trim();
  return `${p}. ${halal ? HALAL_SUFFIX : FREE_SUFFIX}`;
}
