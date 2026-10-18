const CYR: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya", ў: "o", қ: "q", ғ: "g", ҳ: "h" };

// The upload layer percent-encodes the file name into the multipart header and the server stores it as received, so a name with
// spaces or letters outside ASCII would show up as "Scan%202026…". This gives the name a plain form: Latin letters, digits, "-", "_", ".".
const LATIN: Record<string, string> = { ß: "ss", ø: "o", Ø: "O", æ: "ae", Æ: "AE", œ: "oe", Œ: "OE", ł: "l", Ł: "L", đ: "d", Đ: "D", ı: "i", İ: "I", þ: "th", ð: "d" };
const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const EXT_MAX = 5;

// Unique directory name for one upload copy. A counter plus a random part keeps two copies made in the same millisecond apart.
let seq = 0;
export function uploadDirName(now: number = Date.now(), rnd: number = Math.random()): string {
  seq = (seq + 1) % 1_000_000;
  return `up-${now}-${seq}-${Math.floor(rnd * 1e6).toString(36)}`;
}

export function safeUploadName(name: string): string {
  const dot = name.lastIndexOf(".");
  // an extension is up to 5 characters after the last dot; ".pdf" alone is an extension with no stem
  const hasExt = dot >= 0 && name.length - dot - 1 > 0 && name.length - dot <= EXT_MAX + 1;
  const [stem, ext] = hasExt ? [name.slice(0, dot), name.slice(dot + 1)] : [name, ""];
  const plain = (s: string) => {
    const chars = [...s];
    const isUp = (c?: string) => !!c && c !== c.toLowerCase();
    let t = chars.map((ch, i) => {
      if (LATIN[ch]) return LATIN[ch];
      const low = ch.toLowerCase();
      const m = CYR[low];
      if (m === undefined) return ch;
      if (ch === low) return m;
      // inside an all-caps word "Ш" is "SH", at the start of a normal word it is "Sh"
      return isUp(chars[i - 1]) || isUp(chars[i + 1]) ? m.toUpperCase() : m.charAt(0).toUpperCase() + m.slice(1);
    }).join("");
    try {
      t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch {
      /* no normalize: leave the accents, they become "_" below */
    }
    return t.replace(/[\u02bb\u02bc\u2018\u2019'`]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/_+/g, "_").replace(/\.{2,}/g, ".").replace(/^[_.-]+|[_.]+$/g, "");
  };
  let s = plain(stem).slice(0, 80).replace(/[_.]+$/, "") || "file";
  if (RESERVED.test(s)) s = `file_${s}`;
  const e = plain(ext).slice(0, EXT_MAX).toLowerCase(); // lower-case: the policy check and the server compare extensions in lower case
  return e ? `${s}.${e}` : s;
}
