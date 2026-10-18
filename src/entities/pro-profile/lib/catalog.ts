// Backend region keys (same values the marketplace filters on); labels are lawyers.regions.<key>.
export const REGION_KEYS = ["tashkent", "samarkand", "fergana", "bukhara", "namangan", "andijan", "kashkadarya", "khorezm", "jizzakh", "navoi"] as const;

// Practice-area categories of the web registration picker (law-main lib/legalServices.ts).
export const DIRECTION_KEYS = ["family", "realestate", "debt", "court", "criminal", "administrative", "labor", "company", "contracts", "tax", "documents", "gov-disputes", "inheritance", "consumer", "business-protection", "ip", "migration"] as const;
// Only advocates may offer these (a yurist cannot sell criminal / administrative defence).
export const ADVOCATE_ONLY_DIRECTIONS: readonly string[] = ["criminal", "administrative"];
export const LANGUAGE_KEYS = ["uz", "ru", "en", "kaa", "tr", "ar"] as const;
export const STRUCTURE_KEYS = ["byuro", "firma", "hayat"] as const;

// Backend region text ("Toshkent", "tashkent", "Samarkand") → one of REGION_KEYS, else "".
const ALIASES: Record<string, string> = { toshkent: "tashkent", tashkent: "tashkent", samarqand: "samarkand", samarkand: "samarkand", "farg'ona": "fergana", fergana: "fergana", buxoro: "bukhara", bukhara: "bukhara", andijon: "andijan", andijan: "andijan", qashqadaryo: "kashkadarya", xorazm: "khorezm", jizzax: "jizzakh", navoiy: "navoi" };

export function regionKeyOf(text: string): string {
  const s = text.trim().toLowerCase();
  if (!s) return "";
  if ((REGION_KEYS as readonly string[]).includes(s)) return s;
  const hit = Object.keys(ALIASES).find((k) => s === k || s.startsWith(k) || k.startsWith(s));
  return hit ? ALIASES[hit] : s.replace(/\s+(shahri|viloyati|region|city)$/, "");
}

export const isAdvocate = (sellerType: string) => sellerType === "advokat" || sellerType === "advokat_tashkiloti";
