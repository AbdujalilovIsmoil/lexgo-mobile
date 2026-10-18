import { http } from "@/shared/api";
import { API_BASE } from "@/shared/config/env";
import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import { safeHttpsUrl } from "@/shared/lib/pay/safeUrl";

export type ReferralInvite = { name: string; phone: string; status: string; reward: number; joinedAt: string };
export type Referral = {
  code: string;
  link: string;
  qrUrl: string;
  invited: number;
  joined: number;
  reward: number;
  discountUnlocked: boolean;
  discountPercent: number;
  eligibleAfter: number;
  remaining: number;
  appliesTo: string[];
  items: ReferralInvite[];
};

function invite(v: unknown): ReferralInvite {
  const r = asDict(v);
  const p = asDict(r.payload);
  return {
    name: asStr(r.name ?? p.name ?? p.invitee_name ?? p.referred_name ?? r.title),
    phone: asStr(r.phone ?? p.phone ?? p.invitee_phone),
    status: asStr(r.status, "invited"),
    reward: uzs(r, "reward") || uzs(p, "reward", "reward_amount") || uzs(r, "price"),
    joinedAt: asStr(r.joined_at ?? p.joined_at ?? r.created_at),
  };
}

// GET /referrals/me — the QR image is a public PNG at /referrals/{code}/qr.
export async function getReferral(): Promise<Referral> {
  const d = asDict(await http("/referrals/me"));
  const qr = asStr(d.qr_url);
  const applies = Array.isArray(d.applies_to) ? d.applies_to.map((x) => asStr(x)) : asStr(d.applies_to) ? [asStr(d.applies_to)] : [];
  return {
    code: asStr(d.code),
    link: safeHttpsUrl(d.link ?? d.register_url ?? d.share_url),
    qrUrl: qr ? (/^https?:/i.test(qr) ? qr : `${API_BASE}${qr.startsWith("/") ? "" : "/"}${qr}`) : "",
    invited: asNum(d.invited_count ?? d.invited),
    joined: asNum(d.joined_count ?? d.joined),
    reward: uzs(d, "reward_balance", "balance"),
    discountUnlocked: Boolean(d.discount_unlocked),
    discountPercent: asNum(d.discount_percent),
    eligibleAfter: asNum(d.eligible_after, 5),
    remaining: asNum(d.remaining_to_unlock),
    appliesTo: applies,
    items: asArr(d.items ?? d.referrals).map(invite),
  };
}
