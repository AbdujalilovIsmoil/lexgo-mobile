import type { useColors } from "@/shared/theme";

// Accent colour of a payout by status: paid green, failed red, held amber, anything else blue.
export function payoutTint(c: ReturnType<typeof useColors>, status: string): string {
  if (status === "paid") return c.ok;
  if (status === "failed" || status === "cancelled") return c.err;
  return status === "held" ? c.warn : c.accent;
}
