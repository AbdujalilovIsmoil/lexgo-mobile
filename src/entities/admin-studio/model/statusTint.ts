import type { useColors } from "@/shared/theme";
import type { StudioStatus } from "./types";

// Accent colour of a studio status: published green, waiting / needs changes amber, in review blue, draft and archived grey.
export function statusTint(c: ReturnType<typeof useColors>, status: StudioStatus): string {
  if (status === "published") return c.ok;
  if (status === "submitted" || status === "changes_requested") return c.warn;
  if (status === "in_review" || status === "approved") return c.accent;
  return c.gray;
}
