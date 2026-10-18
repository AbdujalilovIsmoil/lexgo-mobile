import { File, Paths } from "expo-file-system";
import { safeUploadName } from "@/shared/lib/safeName";
import { buildDocx, buildDocxText } from "@/shared/lib/scan/docx";
import { outputOf, type ScanFormat } from "@/shared/lib/scan/formats";
import type { ScanFilter } from "@/shared/lib/scan/filters";
import type { OcrLang, OcrPage } from "@/shared/lib/scan/ocr";
import { buildPdf } from "@/shared/lib/scan/pdf";
import { buildZip } from "@/shared/lib/scan/zip";
import { recognizePage } from "./recognize";
import { renderPage, type Rendered } from "./render";
import type { ScanPage } from "./types";

export type ScanFile = { uri: string; name: string; mime: string; size: number; textFailed?: boolean };
const MAX_SIDE = 2000;

// Recognises the text of a rendered page by writing it to the cache for the native engine; null when it cannot be read.
async function readText(r: Rendered, langs: OcrLang[]): Promise<OcrPage | null> {
  const f = new File(Paths.cache, `ocr-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`);
  try {
    f.create({ overwrite: true });
    f.write(r.bytes);
    return await recognizePage(f.uri, langs);
  } catch {
    return null;
  } finally {
    try { f.delete(); } catch { /* the cache is cleaned by the system anyway */ }
  }
}

// Renders every page at full quality and packs them: PDF (one page each, searchable when `ocr` languages are given), DOCX (the
// recognised text, or a picture per page without it), or JPG / PNG (one file, or a .zip when there are several pages).
// The result is written to the cache, ready to upload or share. If the text cannot be read the file is still made from the pictures.
export async function exportScan(pages: ScanPage[], filter: ScanFilter, format: ScanFormat, base: string, ocr: OcrLang[] = []): Promise<ScanFile> {
  const png = format === "png";
  const wantText = ocr.length > 0 && (format === "pdf" || format === "docx");
  const out: Rendered[] = [];
  const text: (OcrPage | null)[] = [];
  for (const p of pages) {
    const r = await renderPage(p, filter, { maxSide: MAX_SIDE, quality: 88, png }); // one at a time: each decode is tens of MB
    out.push(r);
    if (wantText) text.push(await readText(r, ocr));
  }
  if (!out.length) throw new Error("empty");
  const read = text.length > 0 && text.every((t) => t !== null) ? (text as OcrPage[]) : null;
  const textFailed = wantText && !read;
  const o = outputOf(format, pages.length, base);
  const ext = png ? "png" : "jpg";
  const bytes =
    format === "pdf" ? buildPdf(out.map((r, i) => ({ ...r, lines: text[i]?.lines })))
    : format === "docx" ? (read ? buildDocxText(read) : buildDocx(out.map((r) => ({ ...r, ext: "jpg" as const }))))
    : out.length > 1 ? buildZip(out.map((r, i) => ({ name: safeUploadName(`${o.name.replace(/\.zip$/, "")}-${i + 1}.${ext}`), data: r.bytes })))
    : out[0].bytes;
  const name = safeUploadName(o.name); // plain letters only: the server stores the name exactly as it is sent
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(bytes);
  return { uri: file.uri, name, mime: o.mime, size: bytes.length, textFailed };
}
