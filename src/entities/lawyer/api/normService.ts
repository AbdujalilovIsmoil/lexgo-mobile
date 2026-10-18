import { asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import { cleanTitle } from "../lib/cleanTitle";
import type { LawyerReview, LawyerService } from "../model/types";

// One entry of `services[]` (profile) or `items[]` (…/services).
export function normService(v: unknown): LawyerService {
  const d = asDict(v);
  const base = uzs(d, "base_price", "standard_price");
  const promo = asDict(d.promotion);
  return {
    id: asStr(d.id ?? d.service_id),
    title: cleanTitle(asStr(d.title ?? d.name)),
    price: uzs(d, "selected_price") || base,
    basePrice: base,
    category: asStr(d.category_title),
    categoryId: asStr(d.category_id),
    deliveryMinutes: asNum(d.delivery_minutes),
    note: asStr(d.experience_note).trim(),
    sponsored: d.is_sponsored === true || promo.active === true,
  };
}

export function normReview(v: unknown): LawyerReview {
  const d = asDict(v);
  const p = asDict(d.payload);
  const who = asDict(d.author ?? d.client ?? d.reviewer);
  return {
    id: asStr(d.id),
    rating: asNum(d.rating ?? p.rating),
    comment: asStr(d.comment ?? p.comment).trim(),
    author: asStr(d.author_name ?? d.client_name ?? d.reviewer_name ?? who.name ?? p.client_name).trim(),
    createdAt: asStr(d.created_at ?? p.rated_at),
    reply: asStr(d.reply ?? d.seller_reply ?? p.reply).trim(),
  };
}
