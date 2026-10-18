import { asArr, asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { UrgentRequest } from "../model/urgentTypes";
import { normFile, normPeople, normPerson, normSource } from "./urgentPeople";

const strs = (x: unknown) => asArr(x).map((y) => asStr(y)).filter(Boolean);

// Every endpoint answers with this record: people are nested user objects, the rest hangs off `payload`.
export function normUrgent(v: unknown): UrgentRequest {
  const d = asDict(v);
  const p = asDict(d.payload);
  const pick = (k: string) => (d[k] === undefined || d[k] === null ? p[k] : d[k]);
  const client = normPerson(d.client);
  const assigned = normPerson(d.assigned_lawyer);
  const claimed = normPerson(d.claimed_by);
  const group = normPeople(d.group_lawyers);
  const groupIds = strs(p.group_lawyer_user_ids ?? p.lawyer_user_ids);
  return {
    id: asStr(pick("id") ?? pick("record_id")),
    workId: asStr(pick("work_id")),
    serviceKind: asStr(pick("service_kind")),
    serviceTitle: asStr(pick("title") ?? pick("service_title")),
    channel: asStr(pick("channel")),
    status: asStr(pick("status")),
    region: asStr(pick("region")),
    need: asStr(pick("need") ?? pick("description")),
    directions: strs(pick("directions")),
    lawyerCount: asNum(pick("requested_lawyer_count") ?? pick("lawyer_count")),
    amount: uzs({ amount: pick("price") ?? pick("amount") }, "amount"),
    meetingMinutes: asNum(pick("meeting_minutes")),
    client,
    clientName: client?.name || asStr(pick("client_name")),
    clientPhone: client?.phone || asStr(pick("client_phone")),
    assignedLawyer: assigned,
    claimedBy: claimed,
    operator: normPerson(d.operator),
    groupLawyers: group,
    claimedByUserId: claimed?.id || asStr(pick("claimed_by_user_id")),
    assignedLawyerUserId: assigned?.id || asStr(pick("assigned_lawyer_user_id")),
    groupLawyerUserIds: groupIds.length ? groupIds : group.map((g) => g.id),
    nextStatuses: strs(asDict(d.lifecycle).next_statuses),
    history: asArr(p.status_history).map((x) => ({ to: asStr(asDict(x).to), at: asStr(asDict(x).changed_at) })),
    files: [...asArr(p.files).map((f) => normFile(f, false)), ...asArr(p.voice_messages).map((f) => normFile(f, true))].filter((f) => f !== null),
    sources: asArr(p.second_opinion_eligible_sources).map(normSource),
    scheduledAt: asStr(pick("scheduled_at")),
    meetingNote: asStr(p.meeting_note ?? p.note),
    roomId: asStr(pick("secure_chat_room_id") ?? pick("room_id") ?? asDict(d.chat).room_id),
    resultSummary: asStr(p.result_summary ?? p.summary),
    nextAction: asStr(p.next_action),
    completedAt: asStr(p.completed_at),
    cancelReason: asStr(p.cancel_reason),
    cancelledAt: asStr(p.cancelled_at),
    slaBreached: Boolean(pick("sla_breached")),
    immediateCall: Boolean(p.immediate_call),
    createdAt: asStr(pick("created_at")),
  };
}
