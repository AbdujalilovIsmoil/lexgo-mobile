import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";

// The Telegram answer also lands in the notification inbox; this is the fallback when the realtime
// event was missed (app closed). Returns request_id → "approved" | "rejected".
export async function promotionAnswers(): Promise<Record<string, "approved" | "rejected">> {
  const out: Record<string, "approved" | "rejected"> = {};
  for (const n of listFrom(await http("/notifications?limit=40"), "items", "data")) {
    const data = asDict(asDict(n).data);
    const name = asStr(data.event);
    const id = asStr(data.request_id);
    if (id && !out[id] && name.startsWith("promotion.checkout_")) out[id] = name.endsWith("rejected") ? "rejected" : "approved";
  }
  return out;
}
