import type { IconName } from "@/shared/ui";

// Feather icon + accent per file extension.
export function kindIcon(ext: string): { icon: IconName; tint: string } {
  if (ext === "pdf") return { icon: "file-text", tint: "#EF4444" };
  if (/^(docx?|rtf|odt|txt)$/.test(ext)) return { icon: "file-text", tint: "#3B82F6" };
  if (/^(xlsx?|csv|ods)$/.test(ext)) return { icon: "grid", tint: "#22C55E" };
  if (/^(png|jpe?g|gif|webp|heic)$/.test(ext)) return { icon: "image", tint: "#8B5CF6" };
  if (/^(mp3|m4a|wav|ogg)$/.test(ext)) return { icon: "headphones", tint: "#F59E0B" };
  if (/^(mp4|mov|webm)$/.test(ext)) return { icon: "video", tint: "#EC4899" };
  return { icon: "file", tint: "#64748B" };
}
