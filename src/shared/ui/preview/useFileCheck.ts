import { useMemo } from "react";
import { File, FileMode } from "expo-file-system";
import { exceedsPreviewLimit, sniffBlocked, type FileClass } from "@/shared/lib/download";

export type FileCheck = "ok" | "blocked" | "large";

// Looks at the local copy before any viewer touches it: size against the viewer's limit, and the first bytes against the
// name (an "invoice.pdf" that starts with MZ or <html> is never opened). Reads 512 bytes, so it is done inline.
export function useFileCheck(uri: string | null, cls: FileClass): FileCheck {
  return useMemo<FileCheck>(() => {
    if (!uri || !cls.safe) return "ok";
    try {
      const f = new File(uri);
      if (exceedsPreviewLimit(cls.kind, f.size)) return "large";
      const h = f.open(FileMode.ReadOnly);
      try {
        return sniffBlocked(h.readBytes(512), cls.kind) ? "blocked" : "ok";
      } finally {
        h.close();
      }
    } catch {
      return "ok"; // cannot inspect: the name/mime checks still hold, and a viewer failure degrades to "open with"
    }
  }, [uri, cls.safe, cls.kind]);
}
