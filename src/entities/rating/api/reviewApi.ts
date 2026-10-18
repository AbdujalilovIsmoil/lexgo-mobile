import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { PendingReview, ReviewRow } from "../model/types";

// GET /reviews/me — the ratings the client gave (moderated before they count).
export async function listMyReviews(): Promise<ReviewRow[]> {
  return listFrom(await http("/reviews/me"), "items", "data").map((x) => {
    const d = asDict(x);
    return { id: asStr(d.id), lawyerName: asStr(d.lawyer_name), stars: Number(d.rating) || 0, comment: asStr(d.comment), status: asStr(d.status), createdAt: asStr(d.created_at) };
  });
}

// GET /reviews/pending — finished work that has not been rated.
export async function listPendingReviews(): Promise<PendingReview[]> {
  return listFrom(await http("/reviews/pending"), "items", "data").map((x) => {
    const d = asDict(x);
    const p = asDict(d.payload);
    return { id: asStr(d.id ?? d.case_id), caseId: asStr(d.case_id ?? p.case_id), lawyerUserId: asStr(d.lawyer_user_id ?? p.lawyer_user_id), lawyerName: asStr(d.lawyer_name ?? d.lawyer ?? d.name), title: asStr(d.service ?? d.title ?? d.category ?? p.service) };
  });
}
