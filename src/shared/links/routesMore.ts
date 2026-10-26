import { enc, str, type Subject, type Target, type Viewer } from "./types";

const tg = (href: string, fallback: string, label: string, probe?: Target["probe"]): Target => ({ href, fallback, label, probe });

// Documents, orders, payments and the rest. A professional gets their own screens for the same subject.
export function routesMore(s: Subject, v: Viewer): Target | null {
  const id = enc(s.id);
  const seller = v.kind === "seller";
  switch (s.kind) {
    case "doc": {
      if (seller) {
        const rec = /pool/.test(s.event) ? "" : enc(str(s.data.record_id) || s.id);
        return rec ? tg(`/pro/docs/${rec}`, "/pro/docs", "doc") : tg("/pro/docs", "/pro/docs", "doc");
      }
      return id ? tg(`/documents/${id}`, "/documents", "doc", { path: `/document-requests/${id}` }) : tg("/documents", "/documents", "doc");
    }
    case "order": {
      const base = seller ? "/pro/orders" : "/orders";
      const plain = s.event.startsWith("order_") || s.event.startsWith("milestone_");
      return id ? tg(`${base}/${id}`, base, "order", plain && !seller ? { path: `/orders/${id}/status-history` } : undefined) : tg(base, base, "order");
    }
    case "payment":
      return tg(id ? `/payments/${id}` : "/payments", "/payments", "payment");
    case "subscription":
      return tg("/subscription", "/subscription", "subscription");
    case "case":
      return seller ? tg(id ? `/pro/cases/${id}` : "/pro/cases", "/pro/cases", "case") : tg("/(tabs)/works", "/(tabs)/works", "case");
    case "calendar":
      return seller ? tg("/pro/calendar", "/pro/calendar", "calendar") : null;
    case "promotion":
      return seller ? tg("/pro/promotions", "/pro/promotions", "promotion") : null;
    case "registration":
      return seller ? tg("/pro/onboarding", "/pro/onboarding", "registration") : null;
    case "gift":
      return seller ? null : tg("/profile/gifts", "/profile/gifts", "gift");
    case "referral":
      return seller ? tg("/pro/referrals", "/pro/referrals", "referral") : tg("/profile/referral", "/profile/referral", "referral");
    case "security":
      return tg("/security", "/security", "security");
    default:
      return null;
  }
}
