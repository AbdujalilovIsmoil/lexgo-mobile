import type { PillTone } from "@/shared/ui";

// Tone of a work status pill; unknown statuses stay neutral.
const TONE: Record<string, PillTone> = {
  completed: "ok", paid: "ok", result_ready: "ok", verified: "ok", approved: "ok", active: "ok",
  pending: "warn", pending_payment: "warn", new: "warn", open: "warn", created: "warn",
  accepted: "blue", in_progress: "blue", started: "blue", claimed: "blue", sent_to_seller: "blue",
  cancelled: "err", declined: "err", rejected: "err", closed: "gray",
};

export const statusTone = (status: string): PillTone => TONE[status.toLowerCase()] ?? "gray";
