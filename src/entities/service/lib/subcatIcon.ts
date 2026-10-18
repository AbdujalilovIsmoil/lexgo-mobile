import type { IconName } from "@/shared/ui";
import { normalizeSearchText } from "@/shared/lib/searchText";

// Stand-in for the web's per-direction illustrations: the first rule whose word occurs in the
// normalised name wins, so ORDER IS THE SPECIFICITY (labour before contracts, bankruptcy before bank).
const RULES: [string[], IconName][] = [
  [["mehnat", "ishdan boshatish", "ish beruvchi"], "briefcase"],
  [["oila", "aliment", "nikoh", "otalik", "ota ona", "meros", "vasiyat"], "heart"],
  [["bankrotlik"], "trending-down"],
  [["tergov", "ehtiyot chora"], "search"],
  [["prokuror", "jinoyat", "jabrlanuvchi"], "shield"],
  [["transport", "logistika", "yol harakati"], "truck"],
  [["notarial", "ishonchnoma"], "edit-3"],
  [["undirish", "ijro"], "check-circle"],
  [["qarzdorlik", "talabnoma", "sudgacha tartib"], "dollar-sign"],
  [["mamuriy jarima", "mamuriy javobgarlik", "mamuriy huquqbuzarlik", "mamuriy sudlov"], "alert-triangle"],
  [["davlat organlari", "davlat xaridlari"], "flag"],
  [["kredit", "garov", "bank", "tolov tizim"], "credit-card"],
  [["royxatga olish", "ruxsatnoma", "litsenziya", "lisenziya", "migrasiya", "kompaniya royxati", "qurilish nazorati"], "clipboard"],
  [["korporativ", "tasis hujjat", "ishtirokchilar", "tugatish", "qayta tashkil", "ulush", "investisiya", "due diligence", "patent", "tovar belgisi", "mualliflik", "ip nizolari"], "layers"],
  [["shaxsiy nomulkiy"], "user"],
  [["uy joy", "kochmas mulk", "mulk nizolari", "mulkiy huquq", "er huquqi", "chegara nizolari", "ijara"], "home"],
  [["oldi sotdi", "yetkazib berish", "istemolchi", "marketpleys"], "shopping-bag"],
  [["shartnoma", "oferta"], "file-text"],
  [["soliq", "audit", "muvofiqlik", "compliance", "malumotlar himoyasi"], "percent"],
  [["sud arizalari", "iltimosnoma", "sud bosqichi", "sudlov", "arbitraj", "yuqori instansiya", "advokat bilan ariza"], "book-open"],
  [["hujjat"], "file"],
  [["fuqarolik"], "users"],
];

const CYCLE: IconName[] = ["shield", "briefcase", "file-text", "users", "layers", "award"];

export function subcatIcon(name: string, index: number): IconName {
  const n = normalizeSearchText(name);
  const hit = RULES.find(([words]) => words.some((w) => n.includes(w)));
  return hit ? hit[1] : CYCLE[index % CYCLE.length];
}
