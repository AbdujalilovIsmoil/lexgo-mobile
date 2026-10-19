import type { IconName } from "@/shared/ui";
import { fileKind } from "@/shared/lib/fileKind";

// Feather icon + accent per file extension (the shared fileKind helper decides).
export function kindIcon(ext: string, mime = ""): { icon: IconName; tint: string } {
  const k = fileKind(`x.${ext}`, mime);
  return { icon: k.icon, tint: k.tint };
}
