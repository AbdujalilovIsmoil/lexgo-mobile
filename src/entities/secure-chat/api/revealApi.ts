import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { Reveal } from "../model/types";

const path = (roomId: string, tail: string) => `/secure-chats/${encodeURIComponent(roomId)}/content-reveal/${tail}`;

function normReveal(v: unknown): Reveal {
  const d = asDict(v);
  const r = asDict(d.reveal);
  const p = asDict(r.payload);
  return {
    visible: d.content_visible !== false,
    metadataOnly: d.metadata_only_default === true,
    status: asStr(r.status),
    expiresAt: asStr(p.expires_at ?? r.expires_at),
    reason: asStr(p.reason ?? r.reason),
  };
}

// GET …/content-reveal/status — is the room's text visible to me, and until when.
export async function getReveal(roomId: string): Promise<Reveal> {
  return normReveal(await http(path(roomId, "status")));
}

// POST …/request {reason} — returns the id of the pending request (the approver needs it).
export async function requestReveal(roomId: string, reason: string): Promise<string> {
  return asStr(asDict(await http(path(roomId, "request"), { method: "POST", body: { reason } })).id);
}

// POST …/approve {request_id} — the backend answers 404 without the request id.
export async function approveReveal(roomId: string, requestId: string): Promise<void> {
  await http(path(roomId, "approve"), { method: "POST", body: requestId ? { request_id: requestId } : {} });
}
