// Latin/Cyrillic tolerant normalizer, the same one the web catalogue uses before it
// buckets or matches catalogue text: Cyrillic letters become Latin, apostrophes are
// dropped, everything else that is not alphanumeric becomes a space.
const CYR: Record<string, string> = {
  "қ": "q", "ў": "o", "ғ": "g", "ҳ": "h", "х": "x", "ц": "s", "ш": "sh", "щ": "sh", "ч": "ch",
  "ю": "yu", "я": "ya", "ё": "yo", "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e",
  "ж": "j", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o",
  "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "ъ": "", "ь": "", "э": "e",
};

export function normalizeSearchText(value: string): string {
  const lower = value.toLowerCase().replace(/[’'ʻʼ`‘]/g, "");
  let out = "";
  for (const ch of lower) out += ch in CYR ? CYR[ch] : ch;
  return out.replace(/[^a-z0-9]+/g, " ").trim();
}
