import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { MethodInput, PayMethod } from "./types";

function norm(v: unknown): PayMethod {
  const d = asDict(v);
  return { id: asStr(d.id), brand: asStr(d.brand, "uzcard"), last4: asStr(d.last4), expires: asStr(d.expires), isDefault: Boolean(d.is_default), createdAt: asStr(d.created_at) };
}

const base = "/clients/me/payment-methods";

// Only the brand, the last 4 digits and the expiry ever leave the phone — never a full card number.
export const listMethods = async (): Promise<PayMethod[]> => listFrom(await http(base), "items", "data").map(norm).filter((m) => m.id);
export const addMethod = async (i: MethodInput): Promise<PayMethod> => norm(await http(base, { method: "POST", body: { brand: i.brand, last4: i.last4, expires: i.expires, is_default: i.isDefault } }));
export const deleteMethod = async (id: string): Promise<void> => void (await http(`${base}/${encodeURIComponent(id)}`, { method: "DELETE" }));
