import { File, UploadType } from "expo-file-system";
import { API_BASE } from "@/shared/config/env";
import { accessToken, http, parseErrorBody } from "@/shared/api";
import type { Msg, PickedFile } from "../model/types";
import { normMsg } from "./normalize";
import { roomPath } from "./chatApi";

type Opts = { type: "file" | "voice"; replyToId?: string; onProgress?: (ratio: number) => void; signal?: AbortSignal };

async function send(roomId: string, file: PickedFile, o: Opts) {
  const form: Record<string, string> = { message_type: o.type };
  if (o.replyToId) form.reply_to_message_id = o.replyToId;
  const token = accessToken();
  return new File(file.uri).upload(`${API_BASE}${roomPath(roomId, "/messages/upload")}`, {
    uploadType: UploadType.MULTIPART,
    fieldName: "file",
    sessionType: "foreground", // prompt progress and answer; a backgrounded upload fails and shows retry
    mimeType: file.mime || undefined,
    parameters: form,
    headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
    onProgress: (p) => p.totalBytes > 0 && o.onProgress?.(Math.min(1, p.bytesSent / p.totalBytes)),
    signal: o.signal,
  });
}

// POST …/messages/upload (multipart, one file per request) with real upload progress and cancel. A 401 refreshes the token once
// (any authed call does it) and retries. A refusal keeps the whole error body (the quota 413 is an object, not a sentence), so
// uploadRefusal() can explain it in the user's language.
export async function uploadMessage(roomId: string, file: PickedFile, o: Opts): Promise<Msg> {
  let res = await send(roomId, file, o);
  if (res.status === 401) {
    await http("/auth/me").catch(() => undefined);
    res = await send(roomId, file, o);
  }
  const body: unknown = (() => { try { return JSON.parse(res.body); } catch { return {}; } })();
  if (res.status < 200 || res.status >= 300) throw parseErrorBody(res.status, body);
  return normMsg(body);
}
