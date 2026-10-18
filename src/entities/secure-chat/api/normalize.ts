import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { Msg, MsgFile, Reply, Sender } from "../model/types";

export function normSender(v: unknown): Sender | null {
  const d = asDict(v);
  const id = asStr(d.id);
  const name = asStr(d.name);
  return id || name ? { id, name, role: asStr(d.role), phone: asStr(d.phone) } : null;
}

function normFile(d: Record<string, unknown>): MsgFile | null {
  const meta = asDict(d.meta);
  const name = asStr(meta.file_name);
  const path = asStr(meta.download_url);
  return name || path ? { name, mime: asStr(meta.mime_type), size: asNum(meta.size), path } : null;
}

function normReply(v: unknown): Reply | null {
  if (!v || typeof v !== "object") return null;
  const d = asDict(v);
  return { id: asStr(d.id), sender: normSender(d.sender), type: asStr(d.message_type, "text"), content: asStr(d.filtered_content ?? d.content) };
}

// One chat message — the REST row and the websocket frame share this shape.
export function normMsg(v: unknown): Msg {
  const d = asDict(v);
  const meta = asDict(d.meta);
  return {
    id: asStr(d.id),
    senderId: asStr(d.sender_user_id ?? d.sender_id),
    sender: normSender(d.sender),
    type: asStr(d.message_type, "text"),
    content: asStr(d.filtered_content ?? d.content),
    blocked: d.is_blocked === true,
    blockReason: asStr(d.block_reason),
    createdAt: asStr(d.created_at),
    file: normFile(d),
    reply: normReply(d.reply_to),
    replyToId: asStr(d.reply_to_message_id ?? meta.reply_to_message_id),
    urgentId: asStr(meta.urgent_advokat_request_id),
  };
}
