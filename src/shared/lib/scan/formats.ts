export type ScanFormat = "pdf" | "docx" | "jpg" | "png";
export const SCAN_FORMATS: ScanFormat[] = ["pdf", "docx", "jpg", "png"];

const MIME: Record<ScanFormat | "zip", string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  png: "image/png",
  zip: "application/zip",
};

// What one export is called and typed: several pages as JPG / PNG travel in one .zip.
export function outputOf(format: ScanFormat, pages: number, base: string): { name: string; mime: string } {
  const stem = base.trim().replace(/[\\/:*?"<>|]+/g, "_").replace(/\.(pdf|docx?|jpe?g|png|zip)$/i, "").slice(0, 80) || "scan";
  const zip = (format === "jpg" || format === "png") && pages > 1;
  return { name: `${stem}.${zip ? "zip" : format}`, mime: MIME[zip ? "zip" : format] };
}

// Wall-clock name for a fresh scan, e.g. "Scan 2026-10-18 08.40".
export function defaultScanName(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `Scan ${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}-${p(d.getMinutes())}`;
}
