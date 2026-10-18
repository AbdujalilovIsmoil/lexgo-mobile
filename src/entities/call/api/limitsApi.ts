import { http } from "@/shared/api";
import type { Call } from "../model/types";
import { normCall } from "./normalizeCall";

const url = (roomId: string, callId: string, tail: string) => `/secure-chats/${encodeURIComponent(roomId)}/calls/${encodeURIComponent(callId)}/${tail}`;
const post = async (roomId: string, callId: string, tail: string, body: unknown = {}): Promise<Call> => normCall(await http(url(roomId, callId, tail), { method: "POST", body }));

// Meeting clock controls (host only): hold / resume, one free extension, then paid minutes
// confirmed by the client in Telegram.
export const pauseCall = (roomId: string, callId: string, minutes = 5) => post(roomId, callId, "pause", { minutes, reason: "" });
export const resumeCall = (roomId: string, callId: string) => post(roomId, callId, "resume");
export const freeExtend = (roomId: string, callId: string, minutes: number) => post(roomId, callId, "free-extend", { minutes });
export const requestPaidExtension = (roomId: string, callId: string, minutes: number) => post(roomId, callId, "extension-payment-request", { minutes });
