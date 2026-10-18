import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { Referral } from "../model/types";

// GET /referrals/me — own code, share link, QR path and invite statistics.
export async function getReferral(): Promise<Referral> {
  const d = asDict(await http("/referrals/me"));
  return {
    code: asStr(d.code),
    link: asStr(d.link ?? d.register_url),
    qrPath: asStr(d.qr_url),
    invited: asNum(d.invited_count ?? d.invited),
    joined: asNum(d.joined_count ?? d.joined),
    reward: uzs(d, "reward_balance", "balance"),
    discountUnlocked: Boolean(d.discount_unlocked),
    discountPercent: asNum(d.discount_percent),
    eligibleAfter: asNum(d.eligible_after, 5),
    remaining: asNum(d.remaining_to_unlock),
    appliesTo: Array.isArray(d.applies_to) ? d.applies_to.map((x) => asStr(x)) : asStr(d.applies_to) ? [asStr(d.applies_to)] : [],
    items: asArr(d.items ?? d.referrals).map((x) => {
      const r = asDict(x);
      const p = asDict(r.payload);
      return {
        name: asStr(r.name ?? p.name ?? p.invitee_name ?? p.referred_name ?? r.title),
        phone: asStr(r.phone ?? p.phone ?? p.invitee_phone),
        status: asStr(r.status, "invited"),
        reward: uzs(r, "reward") || uzs(p, "reward", "reward_amount") || uzs(r, "price"),
        joinedAt: asStr(r.joined_at ?? p.joined_at ?? r.created_at),
      };
    }),
  };
}
