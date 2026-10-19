import type { ComponentProps } from "react";
import type Feather from "@expo/vector-icons/Feather";

export type FileKindName = "pdf" | "doc" | "sheet" | "slides" | "image" | "archive" | "text" | "audio" | "video" | "file";
export type FileKindInfo = { kind: FileKindName; ext: string; icon: ComponentProps<typeof Feather>["name"]; tint: string };

const KINDS: Record<FileKindName, Pick<FileKindInfo, "icon" | "tint">> = {
  pdf: { icon: "file-text", tint: "#EF4444" },
  doc: { icon: "file-text", tint: "#3B82F6" },
  sheet: { icon: "grid", tint: "#22C55E" },
  slides: { icon: "monitor", tint: "#F97316" },
  image: { icon: "image", tint: "#8B5CF6" },
  archive: { icon: "archive", tint: "#A16207" },
  text: { icon: "align-left", tint: "#64748B" },
  audio: { icon: "headphones", tint: "#F59E0B" },
  video: { icon: "video", tint: "#EC4899" },
  file: { icon: "file", tint: "#64748B" },
};

const BY_EXT: [RegExp, FileKindName][] = [
  [/^pdf$/, "pdf"],
  [/^(docx?|rtf|odt|pages)$/, "doc"],
  [/^(xlsx?|csv|ods|numbers)$/, "sheet"],
  [/^(pptx?|odp|key)$/, "slides"],
  [/^(png|jpe?g|gif|webp|heic|heif|bmp|svg|tiff?)$/, "image"],
  [/^(zip|rar|7z|tar|gz|tgz|bz2)$/, "archive"],
  [/^(txt|md|log)$/, "text"],
  [/^(mp3|m4a|wav|ogg|aac|flac)$/, "audio"],
  [/^(mp4|mov|webm|mkv|avi|m4v)$/, "video"],
];

const BY_MIME: [RegExp, FileKindName][] = [
  [/pdf/, "pdf"],
  [/presentation|powerpoint/, "slides"],
  [/spreadsheet|excel|csv/, "sheet"],
  [/wordprocessing|msword|rtf|opendocument\.text/, "doc"],
  [/zip|rar|7z|tar|gzip/, "archive"],
  [/^text\//, "text"],
  [/^image\//, "image"],
  [/^audio\//, "audio"],
  [/^video\//, "video"],
];

// The extension of a file name, lower-case and without the dot ("" when there is none).
export function extOf(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const i = base.lastIndexOf(".");
  return i > 0 && i < base.length - 1 ? base.slice(i + 1).toLowerCase() : "";
}

// What a file is, from its name (extension first) and its MIME type: the icon and colour the lists show.
export function fileKind(name: string, mime = ""): FileKindInfo {
  const ext = extOf(name);
  const m = mime.toLowerCase();
  const hit = (ext && BY_EXT.find(([re]) => re.test(ext))?.[1]) || BY_MIME.find(([re]) => re.test(m))?.[1] || "file";
  return { kind: hit, ext, ...KINDS[hit] };
}
