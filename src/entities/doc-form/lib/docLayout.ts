// The text of a document (from the server: the heading, the paragraphs, "[spots to fill]") laid out as a page. No guessing at the content: only
// what the shape of a line says — the first line is the title, a short numbered or ALL-CAPS line is a heading, "1)", "-", "a." start a list
// item — and every line break the server sent stays.
export type Seg = { slot: boolean; text: string; n?: number }; // n: the spot's number in the document (1, 2, 3…), set by layoutDoc
export type Block =
  | { kind: "title"; segs: Seg[] }
  | { kind: "heading"; segs: Seg[]; center: boolean }
  | { kind: "item"; marker: string; segs: Seg[] }
  | { kind: "para"; segs: Seg[] }
  | { kind: "gap" };

const SLOT = /(\[[^\]\n]+\]|\{[^}\n]+\})/g;
const NUMBERED = /^(\d+(?:\.\d+)*[.)]?)\s+(\S.*)$/;
const BULLET = /^([-–—•*]|[a-zA-Zа-яА-ЯЎўҚқҒғҲҳ][.)])\s+(\S.*)$/;

const IS_SLOT = /^(\[[^\]\n]+\]|\{[^}\n]+\})$/;

export function segsOf(line: string): Seg[] {
  return line.split(SLOT).filter(Boolean).map((p) => (IS_SLOT.test(p) ? { slot: true, text: p.slice(1, -1).trim() } : { slot: false, text: p }));
}

const caps = (s: string): boolean => {
  const letters = s.replace(/[^A-Za-zА-Яа-яЎўҚқҒғҲҳ]/g, "");
  return letters.length >= 4 && letters === letters.toUpperCase();
};
const endsSentence = (s: string): boolean => /[.,;:!?]$/.test(s.trim());

export function layoutDoc(text: string): Block[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const out: Block[] = [];
  let first = true;
  let blank = 0;
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) { blank += 1; return; }
    if (blank && out.length) out.push({ kind: "gap" });
    const prevBlank = blank > 0 || out.length === 0;
    blank = 0;
    const nextBlank = !lines[i + 1] || !lines[i + 1].trim();
    if (first) { first = false; out.push({ kind: "title", segs: segsOf(line) }); return; }
    const bare = line.replace(SLOT, "x");
    const short = bare.length <= 80;
    if (short && caps(bare) && !endsSentence(bare)) return void out.push({ kind: "heading", segs: segsOf(line), center: true });
    const num = NUMBERED.exec(line);
    if (num && short && !endsSentence(bare) && (prevBlank || nextBlank)) return void out.push({ kind: "heading", segs: segsOf(line), center: false });
    const item = num ?? BULLET.exec(line);
    if (item) return void out.push({ kind: "item", marker: item[1], segs: segsOf(item[2]) });
    out.push({ kind: "para", segs: segsOf(line) });
  });
  // The spots are numbered in reading order, so the page and the form can speak of "field 7".
  let n = 0;
  for (const b of out) if ("segs" in b) for (const g of b.segs) if (g.slot) g.n = ++n;
  return out;
}

// How many spots are left to fill.
export const slotCount = (blocks: Block[]): number => blocks.reduce((n, b) => n + ("segs" in b ? b.segs.filter((s) => s.slot).length : 0), 0);

// The first ~`max` characters of a document for an excerpt: cut at the end of a line, never in the middle of a "[spot to fill]".
export function excerpt(text: string, max: number): string {
  if (text.length <= max) return text;
  let cut = text.slice(0, max);
  const open = Math.max(cut.lastIndexOf("["), cut.lastIndexOf("{"));
  if (open > cut.lastIndexOf("]") && open > cut.lastIndexOf("}")) cut = cut.slice(0, open);
  const nl = cut.lastIndexOf("\n");
  return (nl > max * 0.4 ? cut.slice(0, nl) : cut).trimEnd();
}

// ①…⑳ for the first twenty spots, "(21)" after that.
export const circled = (n: number): string => (n >= 1 && n <= 20 ? String.fromCodePoint(0x2460 + n - 1) : `(${n})`);
