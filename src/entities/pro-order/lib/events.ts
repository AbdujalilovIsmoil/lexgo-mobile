// The four realtime events of a supplemental payment (TZ 11) -> the toast text key and its tone.
export const ADDITIONAL_EVENTS: Record<string, { key: string; tone: "ok" | "err" | "info" }> = {
  "marketplace.additional_payment_requested": { key: "requested", tone: "info" },
  "marketplace.additional_payment_approved": { key: "approved", tone: "ok" },
  "marketplace.additional_payment_rejected": { key: "rejected", tone: "err" },
  "marketplace.additional_payment_escalated": { key: "escalated", tone: "err" },
};
