import { http } from "@/shared/api";
import type { Call } from "../model/types";
import { normCall } from "./normalizeCall";

const url = (roomId: string, callId: string, tail: string) => `/secure-chats/${encodeURIComponent(roomId)}/calls/${encodeURIComponent(callId)}/${tail}`;

// Recording consent (TZ 24.2): nothing records until an approver says yes. off → requested → allowed|denied → recording.
// The call answers with its new `recording_status`; every participant also gets call.recording_* events.
export const requestRecording = async (roomId: string, callId: string): Promise<Call> => normCall(await http(url(roomId, callId, "recording-request"), { method: "POST" }));
export const answerRecording = async (roomId: string, callId: string, allowed: boolean, reason = ""): Promise<Call> => normCall(await http(url(roomId, callId, "recording-permission"), { method: "PATCH", body: { allowed, reason } }));
export const startRecording = async (roomId: string, callId: string): Promise<Call> => normCall(await http(url(roomId, callId, "recording/start"), { method: "POST" }));
