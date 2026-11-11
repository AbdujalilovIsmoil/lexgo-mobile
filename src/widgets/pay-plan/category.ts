import type { PaymentRow } from "@/entities/payment";

// What a payment went to, for the "by category" ring: the plan itself, the marketplace, a service done by a person, or anything else.
export type PayCategory = "sub" | "market" | "services" | "other";
export const CATEGORIES: PayCategory[] = ["sub", "market", "services", "other"];
export const CATEGORY_COLOR: Record<PayCategory, string> = { sub: "#2F7BFF", market: "#8B5CF6", services: "#22C55E", other: "#F59E0B" };

const slug = (s: string) => s.trim().toLowerCase().replace(/[\s-]+/g, "_");

export function categoryOf(p: Pick<PaymentRow, "kind">): PayCategory {
  const k = slug(p.kind);
  if (k.startsWith("subscription") || k === "gift") return "sub";
  if (k.startsWith("marketplace") || k === "order_milestone" || k === "promotion") return "market";
  if (["order", "document_request", "document_review_extra_pages", "call_extension", "private_chat", "upsell_offer"].includes(k)) return "services";
  return "other";
}
