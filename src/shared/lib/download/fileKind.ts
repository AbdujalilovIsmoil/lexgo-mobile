export type FileKind = "image" | "pdf" | "office" | "audio" | "video" | "text" | "other";

const BY_EXT: Record<string, FileKind> = {
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", heic: "image", bmp: "image",
  pdf: "pdf", doc: "office", docx: "office", xls: "office", xlsx: "office", ppt: "office", pptx: "office", odt: "office",
  mp3: "audio", m4a: "audio", wav: "audio", ogg: "audio", aac: "audio", webm: "audio", opus: "audio",
  mp4: "video", mov: "video", mkv: "video", txt: "text", csv: "text", json: "text", md: "text",
};

export const extOf = (name: string): string => (name.split("?")[0].split(".").pop() ?? "").toLowerCase();

// Preview strategy per TZ 29: pdf/image/audio native, office via renderer, rest download/open-with.
export function kindOf(name: string, mime?: string | null): FileKind {
  const m = (mime ?? "").toLowerCase();
  if (m.startsWith("image/")) return "image";
  if (m === "application/pdf") return "pdf";
  if (m.startsWith("audio/")) return "audio";
  if (m.startsWith("video/")) return "video";
  if (/(word|excel|spreadsheet|presentation|officedocument|msword)/.test(m)) return "office";
  return BY_EXT[extOf(name)] ?? "other";
}
