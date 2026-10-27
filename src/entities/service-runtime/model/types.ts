// GET /marketplace/services/{id}/runtime-configuration (TZ.md §4) — only what a client may see. The executor's `rules`, the seller's
// selectable rules, minimum requirements, template and pricing internals are never mapped, so no screen can show them.
export type DurationUnit = "minute" | "hour" | "day";
export type DurationCalendar = "calendar" | "business_days";

// A time as the backend states it, shown as information only: nothing is counted from it on the phone.
export type RuntimeDuration = {
  value: number;
  unit: DurationUnit;
  calendar: DurationCalendar;
  weekdays: number[]; // the business week of `business_days`, ISO 1 = Monday … 7 = Sunday ([] = not given)
};

// The review before the delivery time is set; the service has none when the backend's value is 0 (then `review` is null).
export type RuntimeReview = { time: RuntimeDuration | null; clientNote: string };

export type ClientRule = { id: string; title: string; version: string; body: string };

// A guarantee as the runtime returns it for the placement: its client-facing texts only (no Studio ids, conditions or audiences); the Studio
// icon is read as one of a few kinds.
export type GuaranteeIcon = "shield" | "refund" | "clock" | "lock" | "star" | "doc" | "check";
export type Guarantee = { id: string; icon: GuaranteeIcon; title: string; description: string; trigger: string; resolution: string; resolutionMinutes: number };

// "What the specialist will do": one checklist item's client title and description, read-only.
export type CheckPreview = { id: string; title: string; description: string; required: boolean };

export type ServiceRuntime = {
  serviceId: string;
  placement: string;
  duration: RuntimeDuration | null;
  review: RuntimeReview | null;
  clientRules: ClientRule[];
  guarantees: Guarantee[];
  checklist: CheckPreview[];
};
