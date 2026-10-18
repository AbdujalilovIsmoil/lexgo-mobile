import { http } from "@/shared/api";
import { asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { Moderation, Person, Review, ReviewDetail, ReviewFilter } from "../model/types";

export function normReview(v: unknown): Review {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    status: asStr(d.status, "pending"),
    lawyerName: asStr(d.lawyer_name ?? d.lawyer ?? d.name),
    lawyerUserId: asStr(d.lawyer_user_id ?? d.seller_user_id),
    sellerType: asStr(d.seller_type),
    rating: asNum(d.rating),
    comment: asStr(d.comment ?? d.text),
    note: asStr(d.moderation_note ?? d.note),
    createdAt: asStr(d.created_at),
  };
}

const person = (v: unknown): Person | null => {
  const d = asDict(v);
  return d.id ? { id: asStr(d.id), name: asStr(d.name), phone: asStr(d.phone) } : null;
};

// GET /admin/reviews?status=&seller_type=&rating= — one unpaged list (the server caps it at 20 rows).
export async function listReviews(f: ReviewFilter): Promise<Review[]> {
  const qs = new URLSearchParams();
  if (f.status) qs.set("status", f.status);
  if (f.sellerType) qs.set("seller_type", f.sellerType);
  if (f.rating) qs.set("rating", String(f.rating));
  return listFrom(await http(`/admin/reviews${qs.size ? `?${qs}` : ""}`), "items", "data", "reviews").map(normReview);
}

// GET /admin/reviews/{id} — the review with its seller, client and case / order context.
export async function getReview(id: string): Promise<ReviewDetail> {
  const d = asDict(await http(`/admin/reviews/${encodeURIComponent(id)}`));
  const c = asDict(d.case);
  return {
    review: normReview(d.review ?? d),
    workId: asStr(asDict(d.payload).work_id),
    seller: person(d.seller),
    sellerRegion: asStr(asDict(d.seller_profile).region),
    client: person(d.client),
    caseTitle: asStr(c.title ?? c.case_number),
    orderId: asStr(asDict(d.order).id ?? d.order_id),
  };
}

// PATCH /admin/reviews/{id}/moderate {status: approved|rejected, note}
export async function moderateReview(id: string, m: Moderation): Promise<void> {
  await http(`/admin/reviews/${encodeURIComponent(id)}/moderate`, { method: "PATCH", body: m });
}
