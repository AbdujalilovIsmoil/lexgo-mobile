import type { UrgentCatalog, UrgentService } from "../model/lookupTypes";

export const URGENT_KINDS = ["video_consultation", "express_video_consultation", "traffic_accident_consultation", "chat_consultation", "second_opinion_single", "second_opinion_group"] as const;
export const URGENT_GROUP = "second_opinion_group";
export const NEED_MIN = 10;
export const DIRECTIONS = [
  { slug: "jinoiy", area: "criminal" }, { slug: "fuqarolik", area: "civil" }, { slug: "oila", area: "family" }, { slug: "mehnat", area: "labor" },
  { slug: "mamuriy", area: "administrative" }, { slug: "iqtisodiy", area: "economic" }, { slug: "soliq", area: "tax" },
];

const base = (key: string): UrgentService => ({ key, title: "", price: 0, minutes: 30, variants: [], priorPurchase: false, lawyerMin: 2, lawyerMax: 7, immediate: false });

function fallbackService(key: string): UrgentService {
  if (key === "chat_consultation") return { ...base(key), minutes: 0 };
  if (key === "express_video_consultation" || key === "traffic_accident_consultation") return { ...base(key), immediate: true };
  if (key.startsWith("second_opinion")) {
    const variants = [{ channel: "video", price: 0, pricePerLawyer: 0, minutes: 30 }, { channel: "chat", price: 0, pricePerLawyer: 0, minutes: 0 }];
    return { ...base(key), variants, priorPurchase: key === URGENT_GROUP };
  }
  return base(key);
}

// Without prices the form still works: the server prices the request.
export const urgentFallback = (): UrgentCatalog => ({ services: URGENT_KINDS.map(fallbackService), priced: false });

export function urgentPrice(s: UrgentService | undefined, channel: string, lawyers = 1): number {
  if (!s) return 0;
  const v = s.variants.find((x) => x.channel === channel) ?? s.variants[0];
  if (!v) return s.price;
  return v.pricePerLawyer ? v.pricePerLawyer * Math.max(1, lawyers) : v.price;
}

export const urgentMinutes = (s: UrgentService | undefined, channel: string) => (s ? (s.variants.find((x) => x.channel === channel)?.minutes ?? s.minutes) : 0);
export const urgentChannels = (s: UrgentService | undefined): string[] => (!s ? [] : s.variants.length ? s.variants.map((v) => v.channel).filter(Boolean) : [s.minutes > 0 ? "video" : "chat"]);
