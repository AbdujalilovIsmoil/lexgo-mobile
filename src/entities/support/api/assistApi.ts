import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";

// POST /marketplace/me/orders/{id}/cancel — the client's own order, refused by the server unless it is still unpaid.
export async function cancelOrder(orderId: string, reason: string): Promise<void> {
  await http(`/marketplace/me/orders/${encodeURIComponent(orderId)}/cancel`, { method: "POST", body: { reason } });
}

// POST /telegram/link/start — one-time t.me link (valid 10 min) that connects the account to Telegram.
export async function startTelegramLink(): Promise<string> {
  const d = asDict(await http("/telegram/link/start", { method: "POST", body: {} }));
  return asStr(d.share_url ?? d.url ?? d.link);
}
