// Search over Uzbek Cyrillic and Latin titles alike. Both the query and the text are folded to one plain Latin skeleton, so "shartnoma"
// finds "Шартнома", "ўзбекистон" finds "O'zbekiston", and the many apostrophes of Uzbek Latin (o', o‘, oʻ, o`) do not matter.
const CYR: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
  ў: "o", қ: "q", ғ: "g", ҳ: "h", ҷ: "j", ӣ: "i", ң: "ng", ө: "o",
};

export function fold(s: string): string {
  let out = "";
  for (const ch of s.toLowerCase().normalize("NFC")) {
    const m = CYR[ch];
    if (m !== undefined) out += m;
    else if (/['`’‘ʻʼʹʽ´]/.test(ch)) continue;
    else out += ch;
  }
  // Latin digraphs the Cyrillic side spells with one letter: unify the two spellings of the same sound.
  return out.replace(/g'|gʻ/g, "g").replace(/\s+/g, " ").trim();
}
