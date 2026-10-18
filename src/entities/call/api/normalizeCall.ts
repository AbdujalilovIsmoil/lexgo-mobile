import { WS_BASE } from "@/shared/config/env";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { Call, Extension, Participant, RecState, Recording, Usage } from "../model/types";
import { normQuality } from "./normalizeQuality";

export function normParticipant(v: unknown): Participant {
  const d = asDict(v);
  const user = asDict(d.user);
  return {
    userId: asStr(d.user_id ?? user.id ?? d.id),
    name: asStr(d.name ?? user.name ?? d.full_name),
    role: asStr(d.role),
    status: asStr(d.status),
    mic: d.mic_enabled !== false,
    camera: d.camera_enabled === true,
    screen: d.screen_enabled === true,
  };
}

function normExtension(v: unknown): Extension | null {
  if (!v || typeof v !== "object") return null;
  const d = asDict(v);
  return { id: asStr(d.id), minutes: asNum(d.minutes), amount: asNum(d.amount), status: asStr(d.status), expiresAt: asStr(d.expires_at) };
}

const REC: Record<string, RecState> = { requested: "requested", approved: "allowed", allowed: "allowed", denied: "denied", recording: "recording", started: "recording" };
const normRecording = (d: Record<string, unknown>): Recording => ({ state: REC[asStr(d.recording_status)] ?? "off", requestedBy: asStr(d.recording_requested_by_user_id), allowedBy: asStr(d.recording_allowed_by_user_id), startedBy: asStr(d.recording_started_by_user_id) });
function normUsage(v: unknown): Usage | null {
  if (!v || typeof v !== "object") return null;
  const d = asDict(v);
  return { used: asNum(d.used), limit: asNum(d.limit), remaining: asNum(d.remaining) };
}

// A call (CallSessionOut): roster, host permissions, limits and — for the joiner — the LiveKit token.
export function normCall(v: unknown): Call {
  const d = asDict(v);
  const p = asDict(d.permissions);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    roomId: asStr(d.room_id),
    callerId: asStr(d.caller_user_id),
    type: asStr(d.call_type) === "audio" ? "audio" : "video",
    title: asStr(d.title),
    status: asStr(d.status),
    startedAt: asStr(d.started_at),
    endedAt: asStr(d.ended_at),
    autoEndAt: asStr(d.auto_end_at),
    remaining: asNum(d.remaining_seconds),
    maxMinutes: asNum(d.max_duration_minutes),
    participants: asArr(d.participants).map(normParticipant),
    perms: { canInvite: p.can_invite === true, canMute: p.can_mute === true, canKick: p.can_kick === true, canEnd: p.can_end === true },
    paused: d.paused === true,
    pausedLeft: asNum(d.paused_remaining_seconds),
    pauseExpiresAt: asStr(d.pause_expires_at),
    freeAvailable: d.free_extension_available === true && d.free_extension_used !== true,
    freeMax: asNum(d.free_extension_max_minutes, 3),
    pricePerMin: asNum(d.paid_extension_price_per_minute, 2000),
    pending: normExtension(d.pending_extension_request),
    recording: normRecording(d),
    docRequestId: asStr(d.document_request_id),
    docRecordId: asStr(d.document_lawyer_record_id),
    usage: normUsage(d.client_call_usage),
    participantCount: asNum(d.participant_count),
    canStartNow: d.can_start_now !== false,
    quality: normQuality(d.quality_policy),
    livekitUrl: (asStr(d.livekit_url).trim() || `${WS_BASE}/livekit`).replace(/^http(s?):\/\//i, "ws$1://"),
    livekitToken: asStr(d.livekit_token),
  };
}
