import type { useColors } from "@/shared/theme";

// Accent colour of a review by moderation status: pending amber, approved green, rejected red.
export function reviewTint(c: ReturnType<typeof useColors>, status: string): string {
  if (status === "pending") return c.warn;
  if (status === "approved" || status === "active") return c.ok;
  return status === "rejected" ? c.err : c.accent;
}
