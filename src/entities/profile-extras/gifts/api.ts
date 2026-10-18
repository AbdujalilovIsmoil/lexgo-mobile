import { http } from "@/shared/api";
import { API_BASE } from "@/shared/config/env";
import { asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import { safeHttpsUrl } from "@/shared/lib/pay/safeUrl";
import type { Gift, GiftClaim, GiftCreated, GiftInput } from "./types";

// The redemption code is not a field of the list: it is the last part of the share link.
const codeOf = (d: Record<string, unknown>): string => asStr(d.gift_code ?? d.code) || (/\/gift\/([^/?#]+)/.exec(asStr(d.share_url))?.[1] ?? /\/gifts\/([^/?#]+)\/qr/.exec(asStr(d.qr_url))?.[1] ?? "");
const qrOf = (code: string, qr: string): string => (safeHttpsUrl(qr) || (code ? `${API_BASE}/gifts/${encodeURIComponent(code)}/qr` : ""));

function norm(v: unknown): Gift {
  const d = asDict(v);
  const plan = asStr(d.plan_name);
  const service = asStr(d.service_name);
  const code = codeOf(d);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    direction: asStr(d.direction, "sent"),
    recipientPhone: asStr(d.recipient_phone),
    title: plan || service,
    isService: !plan && !!service,
    termMonths: asNum(d.term_months ?? d.duration_months),
    shareUrl: safeHttpsUrl(d.share_url),
    qrUrl: qrOf(code, asStr(d.qr_url)),
    code,
    status: asStr(d.status),
    createdAt: asStr(d.created_at),
  };
}

export const listGifts = async (): Promise<Gift[]> => listFrom(await http("/gifts"), "items", "data").map(norm).filter((g) => g.id);

// POST /gifts creates the gift AND its payment; whether it was paid is the backend's answer.
export async function createGift(i: GiftInput, provider: string): Promise<GiftCreated> {
  const body = { provider, term_months: i.months, duration_months: i.months, recipient_hint: i.hint, recipient_phone: i.phone, message: i.message, ...(i.planSlug ? { plan_slug: i.planSlug } : { service_id: i.serviceId }) };
  const d = asDict(await http("/gifts", { method: "POST", body }));
  const pay = asDict(d.payment);
  const code = codeOf(d);
  return { id: asStr(d.id), workId: asStr(d.work_id), status: asStr(d.status), code, shareUrl: safeHttpsUrl(d.share_url), qrUrl: qrOf(code, asStr(d.qr_url)), paymentId: asStr(pay.id), paymentUrl: safeHttpsUrl(pay.payment_url), paymentStatus: asStr(pay.status) };
}

// POST /gifts/{code}/claim — starts the recipient's subscription term.
export async function claimGift(code: string): Promise<GiftClaim> {
  const d = asDict(await http(`/gifts/${encodeURIComponent(code.trim())}/claim`, { method: "POST" }));
  return { status: asStr(d.status), startsAt: asStr(d.starts_at), endsAt: asStr(d.ends_at) };
}
