import { extOf } from "./fileKind";
import type { FileKind } from "./fileKind";

/** FileKind plus archives, which the app only ever hands to another app (never unpacks) */
export type ClassKind = FileKind | "archive";

// One place that decides what the app does with a file: show it inside the app, hand it to another app / the share sheet,
// or refuse it. Everything is an allow-list for opening; the block-list only names what must never be opened or forwarded.
export type BlockReason = "blocked_type" | "double_ext" | "mime_mismatch" | "blocked_mime" | "unsafe_name" | "bad_content";
export type FileClass = {
  kind: ClassKind;
  ext: string;
  /** can be shown inside the app (image, pdf, audio, video, text, docx) */
  previewable: boolean;
  /** false: never opened and never handed to another app */
  safe: boolean;
  reason?: BlockReason;
};

const EXT_KIND: Record<string, ClassKind> = {
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", heic: "image", heif: "image", bmp: "image",
  pdf: "pdf",
  doc: "office", docx: "office", xls: "office", xlsx: "office", ppt: "office", pptx: "office", odt: "office", ods: "office", odp: "office", rtf: "office",
  mp3: "audio", m4a: "audio", wav: "audio", ogg: "audio", aac: "audio", opus: "audio", webm: "audio", amr: "audio", flac: "audio",
  mp4: "video", mov: "video", mkv: "video", m4v: "video", "3gp": "video",
  txt: "text", csv: "text", tsv: "text", json: "text", md: "text", log: "text", xml: "text", yaml: "text", yml: "text",
  zip: "archive", rar: "archive", "7z": "archive", tar: "archive", gz: "archive", tgz: "archive",
};

// Executables, installers, scripts, active documents (HTML/SVG can carry script; Office macros), disk images, shortcuts.
const BLOCKED_EXT = new Set([
  "exe", "msi", "msix", "bat", "cmd", "com", "scr", "pif", "dll", "sys", "cpl", "msc", "hta", "lnk", "reg", "inf", "gadget", "jar", "jnlp",
  "apk", "aab", "xapk", "apks", "ipa", "dex", "so", "dylib", "app", "dmg", "pkg", "deb", "rpm", "appimage", "iso", "img", "vhd", "vhdx",
  "sh", "bash", "zsh", "csh", "ksh", "command", "run", "bin", "elf", "out", "ps1", "psm1", "vbs", "vbe", "js", "jse", "mjs", "cjs", "wsf", "wsh",
  "py", "pyc", "pyw", "rb", "pl", "php", "phtml", "asp", "aspx", "jsp", "cgi", "scpt", "workflow", "action", "swf",
  "html", "htm", "xhtml", "shtml", "mht", "mhtml", "svg", "svgz", "url", "webloc", "desktop",
  "docm", "dotm", "xlsm", "xltm", "xlam", "pptm", "potm", "ppam", "ppsm", "sldm", "xll", "wll",
]);

const BLOCKED_MIME = /(msdownload|x-msdos|dosexec|x-executable|x-sharedlib|x-mach-binary|x-sh$|x-shellscript|x-csh|javascript|ecmascript|x-httpd-php|x-php|x-python|java-archive|vnd\.android\.package|x-apple-diskimage|x-msi|x-bat|html|svg|macroenabled|vnd\.ms-.*\.(macro|sheet\.macro)|x-ms-shortcut|x-msdownload)/;

type Family = "image" | "pdf" | "office" | "media" | "text" | "archive";
const extFamily = (k: ClassKind | undefined): Family | null => (k === "audio" || k === "video" ? "media" : k && k !== "other" ? (k as Family) : null);

export const mimeBase = (mime?: string | null): string => (mime ?? "").split(";")[0].trim().toLowerCase();

function mimeFamily(m: string): Family | null {
  if (!m || m === "application/octet-stream" || m === "binary/octet-stream") return null;
  if (m.startsWith("image/")) return "image";
  if (m === "application/pdf") return "pdf";
  if (m.startsWith("audio/") || m.startsWith("video/")) return "media";
  if (/(word|excel|spreadsheet|presentation|officedocument|msword|opendocument|rtf)/.test(m)) return "office";
  if (m.startsWith("text/") || m === "application/json" || m === "application/xml" || m.endsWith("+json") || m.endsWith("+xml")) return "text";
  if (/(zip|x-rar|x-7z|gzip|x-tar)/.test(m)) return "archive";
  return null;
}

// Path separators, ".." segments, control characters and bidi overrides (an RTL override makes "invoice" + U+202E + "fdp.exe" display as "invoiceexe.pdf").
const BIDI = String.fromCharCode(0x202a) + "-" + String.fromCharCode(0x202e) + String.fromCharCode(0x2066) + "-" + String.fromCharCode(0x2069);
const UNSAFE_NAME = new RegExp("[\\\\/\\x00-\\x1f\\x7f" + BIDI + "]|\\.\\.");

const blocked = (ext: string, reason: BlockReason): FileClass => ({ kind: "other", ext, previewable: false, safe: false, reason });

export function classifyFile(name: string, mime?: string | null): FileClass {
  const raw = (name ?? "").split("?")[0];
  if (UNSAFE_NAME.test(raw)) return blocked(extOf(raw), "unsafe_name");
  // "invoice.pdf. " and "invoice.exe." are the same file as "invoice.pdf" / "invoice.exe" on desktop systems
  const base = raw.trim().replace(/[. ]+$/, "");
  const parts = base.split(".");
  const ext = parts.length > 1 ? (parts[parts.length - 1] ?? "").toLowerCase() : "";
  if (BLOCKED_EXT.has(ext)) return blocked(ext, "blocked_type");
  if (parts.slice(1, -1).some((p) => BLOCKED_EXT.has(p.trim().toLowerCase()))) return blocked(ext, "double_ext");

  const m = mimeBase(mime);
  if (m && BLOCKED_MIME.test(m)) return blocked(ext, "blocked_mime");

  const byExt = EXT_KIND[ext];
  const fExt = extFamily(byExt);
  const fMime = mimeFamily(m);
  // the extension and the declared type must agree; Office files are zips, and browsers label .csv as an Excel type
  const tolerated = (fExt === "office" && fMime === "archive") || (fExt === "archive" && fMime === "office") || (fExt === "text" && fMime === "office");
  if (fExt && fMime && fExt !== fMime && !tolerated) {
    return blocked(ext, "mime_mismatch");
  }
  let kind: ClassKind = byExt ?? "other";
  if (!byExt && fMime) kind = fMime === "media" ? (m.startsWith("video/") ? "video" : "audio") : fMime;
  if (ext === "webm" && fMime === "media") kind = m.startsWith("video/") ? "video" : "audio"; // the only container used for both
  const isDocx = ext === "docx" || /wordprocessingml/.test(m);
  const previewable = kind === "image" || kind === "pdf" || kind === "audio" || kind === "video" || kind === "text" || (kind === "office" && isDocx);
  return { kind, ext, previewable, safe: true };
}

// Largest file each in-app viewer is asked to open; above it the file is offered to another app instead.
const LIMIT: Partial<Record<ClassKind, number>> = { image: 40e6, pdf: 150e6, text: 5e6, office: 25e6, audio: 300e6, video: 600e6 };
export const exceedsPreviewLimit = (kind: ClassKind, bytes: number): boolean => {
  const max = LIMIT[kind];
  return max != null && bytes > max;
};

// Looks at the first bytes of the downloaded file: whatever its name says, an executable or a web page is never opened.
export function sniffBlocked(head: ArrayLike<number>, kind: ClassKind): boolean {
  const b = (i: number) => head[i] ?? -1;
  if (b(0) === 0x4d && b(1) === 0x5a) return true; // MZ: Windows PE
  if (b(0) === 0x7f && b(1) === 0x45 && b(2) === 0x4c && b(3) === 0x46) return true; // ELF
  if (b(0) === 0xca && b(1) === 0xfe && b(2) === 0xba && b(3) === 0xbe) return true; // Mach-O fat / Java class
  if (b(0) === 0xfe && b(1) === 0xed && b(2) === 0xfa && (b(3) === 0xce || b(3) === 0xcf)) return true; // Mach-O
  if (b(0) === 0xcf && b(1) === 0xfa && b(2) === 0xed && b(3) === 0xfe) return true; // Mach-O 64 LE
  if (b(0) === 0x64 && b(1) === 0x65 && b(2) === 0x78 && b(3) === 0x0a) return true; // dex
  if (kind === "text") return false; // plain text is only ever shown as text
  if (b(0) === 0x23 && b(1) === 0x21) return true; // #! script
  let s = "";
  for (let i = 0; i < Math.min(head.length, 256); i++) s += String.fromCharCode(head[i] as number);
  return /^\s*(<!doctype\s+html|<html|<script|<svg|<\?xml[^>]*\?>\s*<svg|<\?php)/i.test(s.replace(/^\xef\xbb\xbf/, ""));
}
