import { ascii, concat } from "./bytes";
import { cleanText, type OcrLine } from "./ocr";

export type JpegPage = { bytes: Uint8Array; width: number; height: number; lines?: OcrLine[] };
const A4 = { w: 595, h: 842 };
const GLYPH_EM = 0.5; // advance width (em) the invisible font declares; the real width of a line is fitted with Tz

const hex16 = (s: string) => Array.from({ length: s.length }, (_, i) => s.charCodeAt(i).toString(16).padStart(4, "0")).join("");

// The recognised lines as invisible text (render mode 3) laid over the picture, so the PDF can be searched and copied from.
function textLayer(lines: OcrLine[], at: { x: number; y: number; w: number; h: number }): string {
  const out: string[] = [];
  for (const l of lines) {
    const text = cleanText(l.text);
    if (!text) continue;
    const fs = Math.max(1, l.box.h * at.h);
    const tz = Math.min(1000, Math.max(1, ((l.box.w * at.w) / (text.length * GLYPH_EM * fs)) * 100));
    const x = at.x + l.box.x * at.w;
    const y = at.y + at.h - (l.box.y + l.box.h) * at.h;
    out.push(`BT 3 Tr /F0 ${fs.toFixed(2)} Tf ${tz.toFixed(1)} Tz 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm <${hex16(text)}> Tj ET`);
  }
  return out.join("\n");
}

// Type0 font without glyph outlines: enough for invisible text. Codes are UTF-16 units; ToUnicode maps each code to itself.
const TO_UNICODE = "/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CMapName /Adobe-Identity-UCS def /CMapType 2 def 1 begincodespacerange <0000> <FFFF> endcodespacerange 1 beginbfrange <0000> <FFFF> <0000> endbfrange endcmap CMapName currentdict /CMap defineresource pop end end";

// A PDF with one A4 page per scan: the JPEG is embedded as it is (DCTDecode) and fitted to the page, centred.
export function buildPdf(pages: JpegPage[]): Uint8Array {
  const parts: Uint8Array[] = [];
  const at: number[] = [];
  let size = 0;
  const push = (b: Uint8Array) => (parts.push(b), (size += b.length));
  const obj = (id: number, body: (Uint8Array | string)[]) => {
    at[id] = size;
    push(ascii(`${id} 0 obj\n`));
    body.forEach((b) => push(typeof b === "string" ? ascii(b) : b));
    push(ascii("\nendobj\n"));
  };
  push(ascii("%PDF-1.4\n"));
  const n = pages.length;
  const withText = pages.some((p) => p.lines?.some((l) => cleanText(l.text)));
  const fontId = 3 + n * 3; // Type0 font; its descendant and ToUnicode follow
  obj(1, ["<< /Type /Catalog /Pages 2 0 R >>"]);
  obj(2, [`<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${n} >>`]);
  pages.forEach((p, i) => {
    const page = 3 + i * 3;
    const k = Math.min(A4.w / p.width, A4.h / p.height);
    const w = p.width * k;
    const h = p.height * k;
    const x = (A4.w - w) / 2;
    const y = (A4.h - h) / 2;
    const layer = p.lines?.length ? textLayer(p.lines, { x, y, w, h }) : "";
    const draw = `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im0 Do Q${layer ? `\n${layer}` : ""}`;
    const font = withText ? ` /Font << /F0 ${fontId} 0 R >>` : "";
    obj(page, [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] /Contents ${page + 1} 0 R /Resources << /XObject << /Im0 ${page + 2} 0 R >>${font} >> >>`]);
    obj(page + 1, [`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`]);
    obj(page + 2, [`<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>\nstream\n`, p.bytes, "\nendstream"]);
  });
  if (withText) {
    obj(fontId, [`<< /Type /Font /Subtype /Type0 /BaseFont /LexGoText /Encoding /Identity-H /DescendantFonts [${fontId + 1} 0 R] /ToUnicode ${fontId + 2} 0 R >>`]);
    obj(fontId + 1, [`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /LexGoText /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW ${GLYPH_EM * 1000} /CIDToGIDMap /Identity /FontDescriptor ${fontId + 3} 0 R >>`]);
    obj(fontId + 2, [`<< /Length ${TO_UNICODE.length} >>\nstream\n${TO_UNICODE}\nendstream`]);
    obj(fontId + 3, ["<< /Type /FontDescriptor /FontName /LexGoText /Flags 4 /FontBBox [0 -200 1000 800] /ItalicAngle 0 /Ascent 800 /Descent -200 /CapHeight 700 /StemV 80 >>"]);
  }
  const total = 3 + n * 3 + (withText ? 4 : 0);
  const xref = size;
  push(ascii(`xref\n0 ${total}\n0000000000 65535 f \n${at.slice(1).map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`));
  return concat(parts);
}
