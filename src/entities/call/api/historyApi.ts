import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { CallType } from "../model/types";
import type { Invited } from "../model/historyTypes";

const kind = (v: unknown): CallType => (asStr(v) === "audio" ? "audio" : "video");

/** GET /calls/invited — the calls I hosted or was invited to, newest first; `limit` keeps the ring safety net's request small. */
export async function listInvited(limit?: number): Promise<Invited[]> {
  return listFrom(await http(limit ? `/calls/invited?limit=${limit}` : "/calls/invited"), "items", "data", "calls")
    .map((v) => {
      const d = asDict(v);
      return {
        roomId: asStr(d.room_id),
        callId: asStr(d.call_id ?? d.id),
        type: kind(d.call_type),
        title: asStr(d.title),
        callerName: asStr(d.caller_name),
        callerId: asStr(d.caller_user_id),
        status: asStr(d.status),
        callStatus: asStr(d.call_status ?? d.status),
        startedAt: asStr(d.started_at),
        autoEndAt: asStr(d.auto_end_at),
      };
    })
    .filter((c) => c.roomId && c.callId);
}
