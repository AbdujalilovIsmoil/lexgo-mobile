export type OcrLang = "uz" | "uz-cyrl" | "ru" | "en";
export const OCR_LANGS: OcrLang[] = ["uz", "uz-cyrl", "ru", "en"];

// Position on the page image as fractions (0..1) of its width / height, origin top-left.
export type OcrBox = { x: number; y: number; w: number; h: number };
export type OcrLine = { text: string; box: OcrBox };
export type OcrPage = { lines: OcrLine[] };

// Characters that cannot appear in a PDF text layer or in XML 1.0.
export const cleanText = (s: string): string => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, "").replace(/\s+/g, " ").trim();

// Lines (in reading order) → paragraphs: a new one starts after a clear vertical gap, or when the text jumps back up (next column).
export function paragraphsOf(lines: OcrLine[]): string[] {
  const out: string[] = [];
  let cur = "";
  let prev: OcrLine | undefined;
  for (const l of lines) {
    const text = cleanText(l.text);
    if (!text) continue;
    const gap = prev ? l.box.y - (prev.box.y + prev.box.h) : 0;
    const jumpedUp = prev ? l.box.y < prev.box.y : false;
    if (prev && (gap > 0.6 * prev.box.h || jumpedUp)) {
      out.push(cur);
      cur = "";
    }
    cur = cur ? `${cur} ${text}` : text;
    prev = l;
  }
  if (cur) out.push(cur);
  return out;
}

// The whole recognised text, pages separated by a blank line.
export const textOf = (pages: OcrPage[]): string => pages.map((p) => paragraphsOf(p.lines).join("\n")).join("\n\n").trim();

// Engines return lines in their own order: top to bottom, and left to right for lines on the same row.
export function inReadingOrder(lines: OcrLine[]): OcrLine[] {
  const mid = (l: OcrLine) => l.box.y + l.box.h / 2;
  const byY = [...lines].sort((a, b) => mid(a) - mid(b));
  const out: OcrLine[] = [];
  let row: OcrLine[] = [];
  const flush = () => out.push(...row.sort((a, b) => a.box.x - b.box.x));
  for (const l of byY) {
    if (row.length && Math.abs(mid(l) - mid(row[0])) > 0.5 * Math.min(l.box.h, row[0].box.h)) {
      flush();
      row = [];
    }
    row.push(l);
  }
  flush();
  return out;
}
