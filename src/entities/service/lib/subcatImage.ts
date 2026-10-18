import type { ImageSourcePropType } from "react-native";
import { normalizeSearchText } from "@/shared/lib/searchText";
import { ART, type ArtKey } from "./serviceArt";

type Rule = { any?: string[]; eq?: string[]; art: ArtKey };

// Same rules and same order as the web's SUBCATEGORY_IMAGES (the first rule with a word in the normalised name wins, so ORDER IS THE SPECIFICITY).
const SUB: Rule[] = [
  { any: ["mehnat", "ishdan boshatish", "ish beruvchi"], art: "mehnat-nizolari" },
  { any: ["oila", "aliment", "nikoh", "otalik", "ota ona", "meros", "vasiyat"], art: "oliaviy-meros" },
  { any: ["bankrotlik"], art: "bankrotlik" },
  { any: ["tergov", "ehtiyot chora"], art: "tergov-chorasi" },
  { any: ["prokuror", "jinoyat", "jabrlanuvchi"], art: "prokuror-jinoyat" },
  { any: ["transport", "logistika", "yol harakati"], art: "transport-logistika" },
  { any: ["notarial", "ishonchnoma"], art: "ishonchnoma" },
  { any: ["undirish", "ijro"], art: "ijro" },
  { any: ["qarzdorlik", "talabnoma", "sudgacha tartib"], art: "qarzdorlik" },
  { any: ["mamuriy jarima", "mamuriy javobgarlik", "mamuriy huquqbuzarlik", "mamuriy sudlov"], art: "mamuriy-jarima" },
  { any: ["davlat organlari", "davlat xaridlari"], art: "davlat-orgnalari" },
  { any: ["kredit", "garov", "bank", "tolov tizim"], art: "kredit" },
  { any: ["royxatga olish", "ruxsatnoma", "litsenziya", "lisenziya", "migrasiya", "kompaniya royxati", "qurilish nazorati"], art: "royhatga-olish" },
  { any: ["korporativ", "tasis hujjat", "kompaniyada ozgarish", "ishtirokchilar", "tugatish", "qayta tashkil", "ulush", "investisiya", "due diligence", "patent", "tovar belgisi", "mualliflik", "ip nizolari"], eq: ["m a"], art: "korporativ" },
  { any: ["shaxsiy nomulkiy"], art: "boshqa-fuqorolik" },
  { any: ["uy joy", "kochmas mulk", "mulk nizolari", "mulkiy huquq", "er huquqi", "chegara nizolari", "ijara"], art: "uyjoy-nizolari" },
  { any: ["oldi sotdi", "yetkazib berish", "istemolchi", "marketpleys"], art: "yetkazib-berish" },
  { any: ["shartnoma", "oferta"], art: "shartnomlar" },
  { any: ["soliq", "audit", "muvofiqlik", "compliance", "malumotlar himoyasi"], art: "iqtisodiy" },
  { any: ["sud arizalari", "iltimosnoma", "sud bosqichi", "sudlov", "arbitraj", "yuqori instansiya", "advokat bilan ariza"], art: "sudarizalari" },
  { any: ["hujjat"], art: "boshqa-fuqorolik" },
  { any: ["fuqarolik"], art: "fuqaro" },
];
// The four general categories (fuqarolik / iqtisodiy / jinoiy / ma'muriy).
const CAT: Rule[] = ["fuqaro", "iqtisodiy", "jinoiy", "mamuriy"].map((k) => ({ any: [k === "fuqaro" ? "fuqarolik" : k], art: k as ArtKey }));

const pick = (name: string, rules: Rule[]): ImageSourcePropType | null => {
  const n = normalizeSearchText(name);
  if (!n) return null;
  const hit = rules.find((r) => r.eq?.includes(n) || r.any?.some((w) => n.includes(w)));
  return hit ? ART[hit.art] : null;
};

export const subcatImage = (name: string): ImageSourcePropType | null => pick(name, SUB);
export const categoryImage = (name: string): ImageSourcePropType | null => pick(name, CAT);
