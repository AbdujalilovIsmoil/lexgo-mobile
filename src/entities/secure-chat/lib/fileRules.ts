import { extOf } from "@/shared/lib/fileKind";

// What may leave the phone in a secure chat: the backend's own upload rules (TZ "Secure chat file upload — current backend
// contract"), checked before anything is sent so a file the server refuses is never uploaded in full first.
// The extension decides (the MIME type is not checked); any other extension is refused with 415.
export const ALLOWED_EXTS = ["pdf", "doc", "docx", "xls", "xlsx", "odt", "rtf", "txt", "jpg", "jpeg", "png", "heic", "webp", "mp3", "m4a", "ogg", "wav", "webm", "mp4", "mov", "zip"] as const;
const ALLOWED = new Set<string>(ALLOWED_EXTS);
export const MAX_MB = 50; // every allowed type…
export const VIDEO_MAX_MB = 200; // …except .mp4 / .mov (.webm keeps the regular limit)
const VIDEO = new Set(["mp4", "mov"]);
const MB = 1024 * 1024;

/** The allowed types as the user reads them: "PDF, DOC, …" (JPEG is the same as JPG). */
export const ALLOWED_LIST = ALLOWED_EXTS.filter((e) => e !== "jpeg").map((e) => e.toUpperCase()).join(", ");
/** Passed as `exts` to pickDocuments: true = allowed. */
export const CHAT_EXTS = new RegExp(`\\.(?:${ALLOWED_EXTS.join("|")})$`, "i");
export const isAllowedExt = (ext: string): boolean => ALLOWED.has(ext);
export const isAllowedName = (name: string): boolean => ALLOWED.has(extOf(name));
export const maxMbFor = (ext: string): number => (VIDEO.has(ext) ? VIDEO_MAX_MB : MAX_MB);

type Named = { uri: string; name: string };
const decoded = (uri: string): string => {
  const path = uri.split("?")[0] ?? "";
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
};

/** The extension the server sees. The upload names the file part after the file on disk (a content:// uri after its display name, the
 * picked name), and that is not always the picked name: the iOS gallery hands "IMG_0001.HEIC" over as a .jpg it converted, Android turns
 * a HEIF photo into a .jpeg. */
export const sentExt = (f: Named): string => (f.uri.startsWith("file:") ? extOf(decoded(f.uri)) : "") || extOf(f.name);

export type Screened<T> = { ok: T[]; badType: T[]; tooBig: T[] };
/** Splits picked files into the ones the server takes and the ones it would refuse (type, or size for that type). An unknown size (0) passes. */
export function screenFiles<T extends Named & { size: number }>(files: T[]): Screened<T> {
  const out: Screened<T> = { ok: [], badType: [], tooBig: [] };
  for (const f of files) {
    const ext = sentExt(f);
    if (!ALLOWED.has(ext)) out.badType.push(f);
    else if (f.size > maxMbFor(ext) * MB) out.tooBig.push(f);
    else out.ok.push(f);
  }
  return out;
}
