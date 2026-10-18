import { ascii, concat } from "./bytes";

export type JpegPage = { bytes: Uint8Array; width: number; height: number };
const A4 = { w: 595, h: 842 };

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
  obj(1, ["<< /Type /Catalog /Pages 2 0 R >>"]);
  obj(2, [`<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${n} >>`]);
  pages.forEach((p, i) => {
    const page = 3 + i * 3;
    const k = Math.min(A4.w / p.width, A4.h / p.height);
    const w = p.width * k;
    const h = p.height * k;
    const draw = `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${((A4.w - w) / 2).toFixed(2)} ${((A4.h - h) / 2).toFixed(2)} cm /Im0 Do Q`;
    obj(page, [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] /Contents ${page + 1} 0 R /Resources << /XObject << /Im0 ${page + 2} 0 R >> >> >>`]);
    obj(page + 1, [`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`]);
    obj(page + 2, [`<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>\nstream\n`, p.bytes, "\nendstream"]);
  });
  const total = 3 + n * 3;
  const xref = size;
  push(ascii(`xref\n0 ${total}\n0000000000 65535 f \n${at.slice(1).map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`));
  return concat(parts);
}
