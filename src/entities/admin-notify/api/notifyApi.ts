import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { SendInput, SendResult } from "../model/types";
import { normDeliveries } from "./deliveries";

// POST /admin/notifications — one recipient (user_id) or a whole role (audience_role, fanned out
// by the server in a single call), on one channel, with a category the recipient sees it under.
export async function sendNotification(input: SendInput): Promise<SendResult> {
  const body = {
    channel: input.channel,
    title: input.title,
    body: input.body,
    category: input.category,
    ...(input.audienceRole ? { audience_role: input.audienceRole } : { user_id: input.userId }),
  };
  const raw = await http("/admin/notifications", { method: "POST", body });
  const d = asDict(raw);
  const top = normDeliveries(raw);
  return { id: asStr(d.id), deliveries: top.length ? top : normDeliveries(d.notification, input.channel) };
}
