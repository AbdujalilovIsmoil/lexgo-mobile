import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { resolveBody, type ResolveInput } from "../lib/resolveBody";

export type ResolveResult = { action: string; status: string; telegramSent: boolean | null };

// Operator resolution of a supplemental payment; refunds only START here - Telegram approval finishes them.
export async function resolveAddPay(ticketId: string, requestId: string, i: ResolveInput): Promise<ResolveResult> {
  const url = `/call-center/support/tickets/${encodeURIComponent(ticketId)}/assist/marketplace-additional-payment/${encodeURIComponent(requestId)}/resolve`;
  const d = asDict(await http(url, { method: "POST", body: resolveBody(i) }));
  const tg = d.telegram_sent;
  return { action: i.action, status: asStr(d.status), telegramSent: typeof tg === "boolean" ? tg : null };
}
