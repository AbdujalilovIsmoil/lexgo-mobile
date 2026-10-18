import { http } from "@/shared/api";
import { asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { CcCall, CcCallInput } from "../model/types";

function normCall(v: unknown): CcCall {
  const d = asDict(v);
  const p = asDict(d.payload);
  return {
    id: asStr(d.id),
    direction: asStr(d.record_type ?? p.direction, "incoming"),
    phone: asStr(p.phone) || asStr(d.title),
    status: asStr(d.status, "completed"),
    createdAt: asStr(d.created_at),
    clientUserId: asStr(p.client_user_id),
    topic: asStr(p.topic),
    result: asStr(p.result),
    nextAction: asStr(p.next_action),
    durationSec: asNum(p.duration_sec),
    summary: asStr(p.summary),
  };
}

// GET /call-center/calls[?client_user_id=] — call-center staff only.
export async function listCalls(clientUserId = ""): Promise<CcCall[]> {
  const qs = clientUserId ? `?client_user_id=${encodeURIComponent(clientUserId)}` : "";
  return listFrom(await http(`/call-center/calls${qs}`), "items", "data", "calls").map(normCall);
}

// POST /call-center/calls — manual call log (until telephony fills these in).
export async function logCall(i: CcCallInput): Promise<void> {
  await http("/call-center/calls", {
    method: "POST",
    body: {
      phone: i.phone, direction: i.direction, status: i.status, topic: i.topic, result: i.result,
      next_action: i.nextAction, duration_sec: i.durationSec, summary: i.summary ?? "", ...(i.clientUserId ? { client_user_id: i.clientUserId } : {}),
    },
  });
}
