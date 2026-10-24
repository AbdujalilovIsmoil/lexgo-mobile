import { ApiError, http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { normMarketOrder } from "./marketNorm";
import type { MarketOrder, StatusEntry } from "../model/marketTypes";

// GET /marketplace/me/orders — the signed-in client's purchases.
export async function listMarketOrders(): Promise<MarketOrder[]> {
  const d = await http("/marketplace/me/orders?role_view=client");
  const items = Array.isArray(d) ? d : asArr(asDict(d).items);
  const actions = Object.keys(asDict(asDict(d).client_actions));
  return items.map((o) => normMarketOrder(o, actions)).filter((o) => o.id).sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

const base = (id: string) => `/marketplace/me/orders/${encodeURIComponent(id)}`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One purchase, read fresh (TZ §4, §14: always refetch before rendering): by its id from GET /marketplace/me/orders/{id}; an ADV-… number
// from the list. null when it is not this client's marketplace order.
export async function getMarketOrder(key: string): Promise<MarketOrder | null> {
  if (!UUID.test(key)) return (await listMarketOrders()).find((o) => o.id === key || o.workId === key) ?? null;
  try {
    const d = asDict(await http(base(key)));
    const actions = Object.entries(asDict(d.actions)).filter(([, v]) => !!v).map(([k]) => k);
    const o = normMarketOrder(d, actions);
    return o.id ? o : null;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 403)) return null;
    throw e;
  }
}

// POST …/cancel — only when the backend offered it (cancel_url). Returns the new status.
export async function cancelMarketOrder(id: string, reason: string): Promise<string> {
  const d = await http(`${base(id)}/cancel`, { method: "POST", body: { reason: reason.trim() } });
  return asStr(asDict(asDict(d).order).status, "cancelled").toLowerCase();
}

// POST …/complete — the client confirms the work is done.
export async function completeMarketOrder(id: string, note: string): Promise<string> {
  const d = await http(`${base(id)}/complete`, { method: "POST", body: { note: note.trim() } });
  return asStr(asDict(asDict(d).order).status, "completed").toLowerCase();
}

// GET /orders/{id}/status-history — newest first.
export async function getStatusHistory(orderId: string): Promise<StatusEntry[]> {
  const d = await http(`/orders/${encodeURIComponent(orderId)}/status-history`);
  const items = Array.isArray(d) ? d : asArr(asDict(d).items ?? asDict(d).history);
  return items.map((x) => ({ status: asStr(asDict(x).status ?? asDict(x).stage).toLowerCase(), note: asStr(asDict(x).note), at: asStr(asDict(x).created_at ?? asDict(x).at) })).sort((a, b) => (a.at < b.at ? 1 : -1));
}
