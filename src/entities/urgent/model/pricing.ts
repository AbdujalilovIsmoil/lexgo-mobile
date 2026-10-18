import type { UrgentService } from "./catalogTypes";

// Which channels a service can be ordered on: its variants, otherwise the one its length implies.
export function channelsOf(s: UrgentService | undefined): string[] {
  if (!s) return [];
  if (s.variants.length) return s.variants.map((v) => v.channel).filter(Boolean);
  return [s.meetingMinutes > 0 ? "video" : "chat"];
}

// Price of one configuration: a flat price or a per-channel variant; the group variant is priced per advocate.
export function priceOf(s: UrgentService | undefined, channel: string, lawyers = 1): number {
  if (!s) return 0;
  const v = s.variants.find((x) => x.channel === channel) ?? s.variants[0];
  if (!v) return s.price;
  return v.pricePerLawyer ? v.pricePerLawyer * Math.max(1, lawyers) : v.price;
}

export function minutesOf(s: UrgentService | undefined, channel: string): number {
  if (!s) return 0;
  const v = s.variants.find((x) => x.channel === channel);
  return v ? v.meetingMinutes : s.meetingMinutes;
}

// Smallest price a card can show ("from …"); `perLawyer` says the figure is per advocate.
export function fromPrice(s: UrgentService): { amount: number; perLawyer: boolean } {
  const per = s.variants.some((v) => v.pricePerLawyer > 0);
  const prices = (s.variants.length ? s.variants.map((v) => v.price || v.pricePerLawyer) : [s.price]).filter((n) => n > 0);
  return { amount: prices.length ? Math.min(...prices) : 0, perLawyer: per };
}
