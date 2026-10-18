import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { PromoPackage, PromoResult } from "../model/serviceTypes";

const enc = encodeURIComponent;

// GET /promotions/packages?placement=service_boost — what a service promotion can be bought as.
export async function listPromoPackages(): Promise<PromoPackage[]> {
  const raw = asDict(await http("/promotions/packages?placement=service_boost"));
  return asArr(raw.items)
    .map((v) => asDict(v))
    .filter((d) => asStr(d.id) && asStr(d.status, "active") === "active")
    .map((d) => ({ id: asStr(d.id), title: asStr(d.title), price: uzs(d, "price"), days: Math.max(1, asNum(d.days, 7)), placement: asStr(d.placement, "service_boost") }))
    .sort((a, b) => a.price - b.price);
}

// POST …/services/{id}/promotion-checkout — creates a PENDING request that ops confirm (never marks anything paid).
export async function requestPromotion(org: string, member: string, serviceId: string, pkg: PromoPackage): Promise<PromoResult> {
  const path = `/organizations/${enc(org)}/members/${enc(member)}/services/${enc(serviceId)}/promotion-checkout`;
  const raw = asDict(await http(path, { method: "POST", body: { package_id: pkg.id, days: pkg.days, provider: "telegram_manual", placement: pkg.placement, service_id: serviceId, target_user_id: member, organization_id: org } }));
  const gate = asDict(raw.payment_gate ?? raw.payment);
  return { requestId: asStr(raw.checkout_request_id ?? raw.request_id ?? gate.id), amount: uzs(gate, "amount") || pkg.price, telegramSent: gate.telegram_sent === true };
}
