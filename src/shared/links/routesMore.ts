import { enc, str, type Subject, type Target, type Viewer } from "./types";

const tg = (href: string, fallback: string, label: string, probe?: Target["probe"]): Target => ({ href, fallback, label, probe });

// Documents, orders, payments and the rest. Sellers and staff get their own screens for the same subject.
export function routesMore(s: Subject, v: Viewer): Target | null {
  const id = enc(s.id);
  const seller = v.kind === "seller";
  switch (s.kind) {
    case "doc": {
      if (v.kind === "staff" || v.kind === "callcenter") return v.callCenterLawyer ? tg("/pro/docs/pool", "/pro/docs/pool", "doc") : null;
      if (seller) {
        if (/pool/.test(s.event)) return tg("/pro/docs/pool", "/pro/docs", "doc");
        const rec = enc(str(s.data.record_id) || s.id);
        return rec ? tg(`/pro/docs/${rec}`, "/pro/docs", "doc") : tg("/pro/docs", "/pro/docs", "doc");
      }
      return id ? tg(`/documents/${id}`, "/documents", "doc", { path: `/document-requests/${id}` }) : tg("/documents", "/documents", "doc");
    }
    case "order": {
      if (v.kind === "staff") return tg("/manage/marketplace", "/manage/marketplace", "order");
      if (v.kind === "callcenter") return null;
      const base = seller ? "/pro/orders" : "/orders";
      const plain = s.event.startsWith("order_") || s.event.startsWith("milestone_");
      return id ? tg(`${base}/${id}`, base, "order", plain && !seller ? { path: `/orders/${id}/status-history` } : undefined) : tg(base, base, "order");
    }
    case "payment":
      return v.kind === "staff" || v.kind === "callcenter" ? null : tg(id ? `/payments/${id}` : "/payments", "/payments", "payment");
    case "subscription":
      return v.kind === "staff" || v.kind === "callcenter" ? null : tg("/subscription", "/subscription", "subscription");
    case "case":
      return seller ? tg(id ? `/pro/cases/${id}` : "/pro/cases", "/pro/cases", "case") : v.kind === "client" ? tg("/(tabs)/works", "/(tabs)/works", "case") : null;
    case "calendar":
      return seller ? tg("/pro/calendar", "/pro/calendar", "calendar") : null;
    case "promotion":
      return seller ? tg("/pro/promotions", "/pro/promotions", "promotion") : null;
    case "registration":
      return v.kind === "staff" ? tg("/manage/registerRequests", "/manage/registerRequests", "registration") : seller ? tg("/pro/onboarding", "/pro/onboarding", "registration") : null;
    case "gift":
      return v.kind === "client" ? tg("/profile/gifts", "/profile/gifts", "gift") : null;
    case "referral":
      return v.kind === "client" ? tg("/profile/referral", "/profile/referral", "referral") : seller ? tg("/pro/referrals", "/pro/referrals", "referral") : null;
    case "security":
      return tg("/security", "/security", "security");
    case "lead":
      if (v.sales) return tg("/(tabs)/pipeline", "/(tabs)/pipeline", "lead");
      return v.kind === "staff" ? tg("/manage/pipeline", "/manage/pipeline", "lead") : v.kind === "callcenter" ? tg("/(tabs)/leads", "/(tabs)/leads", "lead") : null;
    case "approval":
      return v.kind === "staff" ? tg("/manage/approvals", "/manage/approvals", "approval") : null;
    case "studio":
      return v.kind === "staff" ? tg("/manage/studio/objects", "/manage/studio", "studio") : null;
    case "internal":
      return v.kind === "staff" ? tg("/manage/internal", "/manage/internal", "internal") : null;
    default:
      return null;
  }
}
