import { http } from "@/shared/api";
import { asDict, asStr, listFrom, uzs } from "@/shared/lib/json";

export type Payout = { id: string; amount: number; currency: string; status: string; period: string; createdAt: string };

// GET /payouts/me — what a seller (lawyer/advocate) is owed or was paid; read-only.
export async function listMyPayouts(): Promise<Payout[]> {
  return listFrom(await http("/payouts/me"), "items", "data").map((x, i) => {
    const d = asDict(x);
    return { id: asStr(d.id) || `p${i}`, amount: uzs(d, "amount", "seller_share"), currency: asStr(d.currency, "UZS"), status: asStr(d.status, "pending"), period: asStr(d.period ?? d.month), createdAt: asStr(d.created_at) };
  });
}
