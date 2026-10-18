import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { Candidate, ClaimResult, DocReq, TransferInput } from "../model/types";
import { normCandidate } from "./normalizeCandidate";
import { normDoc } from "./normalize";

const enc = encodeURIComponent;

// GET /lawyers/me/document-requests[?status=] — every record of the signed-in advocate.
// The endpoint ignores limit/offset, so lists are narrowed by status and paged on the device.
export async function listMyDocs(status = ""): Promise<DocReq[]> {
  const q = status ? `?status=${enc(status)}` : "";
  return listFrom(await http(`/lawyers/me/document-requests${q}`), "items", "data", "requests").map(normDoc);
}

export const getMyDoc = async (id: string): Promise<DocReq> => normDoc(await http(`/lawyers/me/document-requests/${enc(id)}`));

// GET /call-center/document-requests/open — the shared pool (403 for everyone but call-center lawyers).
export async function listPool(): Promise<DocReq[]> {
  return listFrom(await http("/call-center/document-requests/open"), "items", "data").map(normDoc);
}

// POST …/{record}/claim — 409 "Bu ish allaqachon boshqa advokat tomonidan olingan" when somebody was faster.
export async function claimDoc(id: string): Promise<ClaimResult> {
  const d = asDict(await http(`/call-center/document-requests/${enc(id)}/claim`, { method: "POST", body: {} }));
  const lr = normDoc(d.lawyer_request ?? d);
  return { id: lr.id || id, status: lr.status, chatRoomId: lr.chatRoomId || asStr(asDict(d.secure_chat_room).id) };
}

// Hand a claimed record to another advocate. The assignee uses /lawyers/me/…, the call-center
// pool owner /call-center/…; the backend takes `target_lawyer_user_id` (+ optional reason).
export async function transferDoc({ id, targetId, reason, pool }: TransferInput): Promise<void> {
  const base = pool ? "/call-center/document-requests" : "/lawyers/me/document-requests";
  await http(`${base}/${enc(id)}/transfer`, { method: "POST", body: { target_lawyer_user_id: targetId, reason } });
}

// Advocates a record may be handed to: the call-center candidate list, else the public matching list.
export async function listCandidates(): Promise<Candidate[]> {
  try {
    return listFrom(await http("/call-center/urgent-advokat/candidates")).map(normCandidate);
  } catch {
    return listFrom(await http("/matching/candidates")).map(normCandidate);
  }
}
