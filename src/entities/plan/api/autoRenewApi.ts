import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";

// PATCH /subscriptions/{id}/auto-renew — the backend echoes the new flag. No GET exposes it.
export async function setAutoRenew(subscriptionId: string, autoRenew: boolean, paymentMethodId?: string): Promise<boolean> {
  const body = { auto_renew: autoRenew, ...(paymentMethodId ? { payment_method_id: paymentMethodId } : {}) };
  const d = asDict(await http(`/subscriptions/${encodeURIComponent(subscriptionId)}/auto-renew`, { method: "PATCH", body }));
  return asStr(d.id) ? d.auto_renew === true : autoRenew;
}
