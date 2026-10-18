import { File, Paths } from "expo-file-system";
import { safeUploadName } from "@/shared/lib/safeName";
import { buildDocx } from "@/shared/lib/scan/docx";
import { outputOf, type ScanFormat } from "@/shared/lib/scan/formats";
import type { ScanFilter } from "@/shared/lib/scan/filters";
import { buildPdf } from "@/shared/lib/scan/pdf";
import { buildZip } from "@/shared/lib/scan/zip";
import { renderPage, type Rendered } from "./render";
import type { ScanPage } from "./types";

export type ScanFile = { uri: string; name: string; mime: string; size: number };
const MAX_SIDE = 2000;

// Renders every page at full quality and packs them: PDF (one page each), DOCX (a picture per page), or JPG / PNG
// (one file, or a .zip when there are several pages). The result is written to the cache, ready to upload or share.
export async function exportScan(pages: ScanPage[], filter: ScanFilter, format: ScanFormat, base: string): Promise<ScanFile> {
  const png = format === "png";
  const out: Rendered[] = [];
  for (const p of pages) out.push(await renderPage(p, filter, { maxSide: MAX_SIDE, quality: 88, png })); // one at a time: each decode is tens of MB
  if (!out.length) throw new Error("empty");
  const o = outputOf(format, pages.length, base);
  const ext = png ? "png" : "jpg";
  const bytes =
    format === "pdf" ? buildPdf(out)
    : format === "docx" ? buildDocx(out.map((r) => ({ ...r, ext: "jpg" as const })))
    : out.length > 1 ? buildZip(out.map((r, i) => ({ name: safeUploadName(`${o.name.replace(/\.zip$/, "")}-${i + 1}.${ext}`), data: r.bytes })))
    : out[0].bytes;
  const name = safeUploadName(o.name); // plain letters only: the server stores the name exactly as it is sent
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(bytes);
  return { uri: file.uri, name, mime: o.mime, size: bytes.length };
}
