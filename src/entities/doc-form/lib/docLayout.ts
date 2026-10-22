// The text of a document (from the server: the heading, the paragraphs, "[spots to fill]") laid out as a page. The server sends flat lines with no
// alignment, so the layout reads the shape of the document the way a reader does:
//  · lines before the first ALL-CAPS line (ARIZA / А Р И З А) are the recipient block — it stands on the right of the page;
//  · that ALL-CAPS line is the title, a "(…)" line under it is its subtitle;
//  · the closing short lines (a name, "имзо", a date — or one line of nothing but spots) are the signature row: the first on the left, the last on the
//    right, a middle one centred;
//  · a short "Key: value" line (Da'vogar: […], Manzil: […]) is a row — the key on the left, the value on the right;
//  · in between: a short numbered or ALL-CAPS line is a heading, "1)", "-", "a." start a list item. Every line break the server sent stays.
export type Seg = { slot: boolean; text: string; n?: number }; // n: the spot's number in the document (1, 2, 3…), set by layoutDoc
export type Block =
  | { kind: "recipient"; lines: Seg[][] }
  | { kind: "title"; segs: Seg[] }
  | { kind: "subtitle"; segs: Seg[] }
  | { kind: "heading"; segs: Seg[]; center: boolean }
  | { kind: "item"; marker: string; segs: Seg[] }
  | { kind: "para"; segs: Seg[] }
  | { kind: "kv"; key: string; value: Seg[] }
  | { kind: "sign"; cells: Seg[][] }
  | { kind: "gap" };

const SLOT = /(\[[^\]\n]+\]|\{[^}\n]+\})/g;
const IS_SLOT = /^(\[[^\]\n]+\]|\{[^}\n]+\})$/;
const NUMBERED = /^(\d+(?:\.\d+)*[.)]?)\s+(\S.*)$/;
const BULLET = /^([-–—•*]|[a-zA-Zа-яА-ЯЎўҚқҒғҲҳ][.)])\s+(\S.*)$/;
// "Key: value": a short label (up to four words, no digits-numbering, no spot) before the colon and a short value after it.
const KEY_VALUE = /^([^:\[\]{}\d][^:\[\]{}]{1,30}):\s+(\S.*)$/;
const SIGN_WORD = /^[\s_\-–—.()]*(имзо|imzo|подпись|signature)[\s_\-–—.()]*$/i;

export function segsOf(line: string): Seg[] {
  return line.split(SLOT).filter(Boolean).map((p) => (IS_SLOT.test(p) ? { slot: true, text: p.slice(1, -1).trim() } : { slot: false, text: p }));
}

const bareOf = (s: string): string => s.replace(SLOT, "x");
const caps = (s: string): boolean => {
  const letters = s.replace(/[^A-Za-zА-Яа-яЎўҚқҒғҲҳ]/g, "");
  return letters.length >= 4 && letters === letters.toUpperCase();
};
const endsSentence = (s: string): boolean => /[.,;:!?]$/.test(s.trim());
const endsStop = (s: string): boolean => /[.,;!?]$/.test(s.trim()); // a colon does not end a heading ("SO'RAYMAN:")
const isTitleLine = (t: string): boolean => { const b = bareOf(t); return b.length <= 80 && caps(b) && !endsSentence(b); };
// A line of nothing but spots ("[date][sign][name]"): spots with only spaces between.
const slotOnly = (t: string): boolean => /x/.test(bareOf(t)) && bareOf(t).replace(/[x\s]/g, "") === "";
const slotsIn = (t: string): number => (bareOf(t).match(/x/g) ?? []).length;
const isRule = (t: string): boolean => /_{4,}/.test(t) || /^[\s\-–—.]{4,}$/.test(t);
// What can stand in a signature row: a spot, the word "signature", a ruled line — and short.
const closing = (t: string): boolean => bareOf(t).length <= 70 && (slotOnly(t) || SIGN_WORD.test(t) || isRule(t));

type Ln = { t: string; gap: boolean };

export function layoutDoc(text: string): Block[] {
  const ne: Ln[] = [];
  let gap = false;
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const t = raw.trim();
    if (!t) { gap = true; continue; }
    ne.push({ t, gap });
    gap = false;
  }
  const out: Block[] = [];
  if (!ne.length) return out;

  // Head: the recipient block (2+ lines before the first ALL-CAPS line, within the first eight) and the title.
  let start = 0;
  const capsAt = ne.slice(0, 8).findIndex((l) => isTitleLine(l.t));
  if (capsAt >= 2 && ne.slice(0, capsAt).every((l) => bareOf(l.t).length <= 200)) {
    out.push({ kind: "recipient", lines: ne.slice(0, capsAt).map((l) => segsOf(l.t)) });
    out.push({ kind: "title", segs: segsOf(ne[capsAt].t) });
    start = capsAt + 1;
  } else {
    out.push({ kind: "title", segs: segsOf(ne[0].t) });
    start = 1;
  }
  if (ne[start] && /^\(.*\)$/.test(ne[start].t)) { out.push({ kind: "subtitle", segs: segsOf(ne[start].t) }); start += 1; }

  // Tail: the signature row.
  let end = ne.length;
  let cells: Seg[][] | null = null;
  const tail: Ln[] = [];
  for (let i = ne.length - 1; i >= start && tail.length < 3 && closing(ne[i].t); i--) tail.unshift(ne[i]);
  if (tail.length >= 2) { cells = tail.map((l) => segsOf(l.t)); end = ne.length - tail.length; }
  else if (tail.length === 1 && slotOnly(tail[0].t) && slotsIn(tail[0].t) >= 2) { cells = segsOf(tail[0].t).filter((g) => g.slot).map((g) => [g]); end = ne.length - 1; }

  for (let i = start; i < end; i++) {
    const { t, gap: before } = ne[i];
    if (before && out.length) out.push({ kind: "gap" });
    const prevBlank = before || i === start;
    const nextBlank = i + 1 >= end || ne[i + 1].gap;
    const bare = bareOf(t);
    const short = bare.length <= 80;
    if (short && caps(bare) && !endsStop(bare)) { out.push({ kind: "heading", segs: segsOf(t), center: true }); continue; }
    const kv = KEY_VALUE.exec(t);
    if (kv && kv[1].trim().split(/\s+/).length <= 4 && !endsSentence(kv[1]) && bareOf(kv[2]).length <= 90) { out.push({ kind: "kv", key: kv[1].trim(), value: segsOf(kv[2]) }); continue; }
    const num = NUMBERED.exec(t);
    if (num && short && !endsSentence(bare) && (prevBlank || nextBlank)) { out.push({ kind: "heading", segs: segsOf(t), center: false }); continue; }
    const item = num ?? BULLET.exec(t);
    if (item) { out.push({ kind: "item", marker: item[1], segs: segsOf(item[2]) }); continue; }
    out.push({ kind: "para", segs: segsOf(t) });
  }
  if (cells) { out.push({ kind: "gap" }); out.push({ kind: "sign", cells }); }

  // The spots are numbered in reading order, so the page and the form can speak of "field 7".
  let n = 0;
  for (const g of segsOfBlocks(out)) if (g.slot) g.n = ++n;
  return out;
}

// Every segment of every block, in reading order.
function segsOfBlocks(blocks: Block[]): Seg[] {
  return blocks.flatMap((b): Seg[] => (b.kind === "recipient" ? b.lines.flat() : b.kind === "sign" ? b.cells.flat() : b.kind === "kv" ? b.value : "segs" in b ? b.segs : []));
}

// How many spots are left to fill.
export const slotCount = (blocks: Block[]): number => segsOfBlocks(blocks).filter((g) => g.slot).length;

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

// A signature cell that is only the word "signature" or a ruled line: drawn as a line with a caption, not as text.
export const isSignatureCell = (cell: Seg[]): boolean => cell.length === 1 && !cell[0].slot && (SIGN_WORD.test(cell[0].text) || isRule(cell[0].text));
export const signatureCaption = (cell: Seg[]): string => (cell[0] && SIGN_WORD.test(cell[0].text) ? cell[0].text.replace(/[\s_\-–—.()]/g, "") : "");
