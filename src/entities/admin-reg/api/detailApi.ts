import { http } from "@/shared/api";
import { asArr, asDict } from "@/shared/lib/json";
import type { RegDetail } from "../model/types";
import { normSellerRequest } from "./sellerApi";
import { normActivity, normDoc, normPending, normProfile, normUser, normVerifyItem } from "./detailNorm";

// GET /admin/register-requests/{id} — sign-up form data, linked user / seller profile,
// verification checklist, uploaded proof documents and recent activity.
export async function getRegDetail(id: string): Promise<RegDetail> {
  const d = asDict(await http(`/admin/register-requests/${encodeURIComponent(id)}`));
  return {
    request: normSellerRequest(d.request),
    pending: d.pending ? normPending(d.pending) : null,
    user: d.user ? normUser(d.user) : null,
    profile: d.lawyer_profile ? normProfile(d.lawyer_profile) : null,
    docs: asArr(d.proof_documents).map(normDoc),
    items: asArr(d.verification_items).map(normVerifyItem),
    activity: asArr(d.activity).map(normActivity),
  };
}
