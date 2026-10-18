import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { CallType } from "../model/types";
import type { AdminCall } from "../model/historyTypes";

export const kind = (v: unknown): CallType => (asStr(v) === "audio" ? "audio" : "video");

export function normAdminCall(v: unknown): AdminCall {
  const d = asDict(v);
  return {
    id: asStr(d.id ?? d.call_id),
    workId: asStr(d.work_id),
    status: asStr(d.status),
    title: asStr(d.title),
    type: kind(d.call_type),
    roomId: asStr(d.room_id),
    creatorId: asStr(d.creator_user_id ?? d.caller_user_id),
    creatorName: asStr(d.creator_name ?? d.caller_name),
    participants: asNum(d.participant_count),
    durationSec: asNum(d.duration_seconds),
    startedAt: asStr(d.started_at),
    endedAt: asStr(d.ended_at),
  };
}
