import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { Chat, ChatMessage, Contract, Source } from "../model/types";

export function normSources(v: unknown): Source[] {
  return asArr(v).map((s) => {
    if (typeof s === "string") return { title: s };
    const d = asDict(s);
    return {
      title: asStr(d.title ?? d.name ?? d.document ?? d.source),
      url: typeof d.url === "string" ? d.url : undefined,
      snippet: typeof d.snippet === "string" ? d.snippet : undefined,
    };
  });
}

export function normContracts(v: unknown): Contract[] {
  return asArr(v)
    .map((x) => {
      const d = asDict(x);
      return {
        id: asStr(d.id),
        contractType: asStr(d.contract_type ?? d.contractType),
        status: asStr(d.status),
        downloadUrl: asStr(d.download_url ?? d.downloadUrl ?? d.inline_url ?? d.url),
        fileName: asStr(d.file_name ?? d.fileName) || undefined,
        mimeType: asStr(d.mime_type ?? d.mimeType) || undefined,
      };
    })
    .filter((c) => c.id || c.downloadUrl);
}

let seq = 0;
export const localId = () => `local_${Date.now().toString(36)}_${++seq}`;
export const isLocalId = (id: string) => id.startsWith("local_");

export function normMessage(v: unknown): ChatMessage {
  const d = asDict(v);
  return {
    id: d.id != null ? String(d.id) : localId(),
    role: d.role === "user" ? "user" : "assistant",
    content: asStr(d.content ?? d.text),
    sources: normSources(d.sources),
    contracts: normContracts(d.contracts),
    createdAt: typeof d.created_at === "string" ? d.created_at : undefined,
  };
}

export function normChat(v: unknown): Chat {
  const d = asDict(v);
  const last = asDict(d.last_message ?? d.lastMessage);
  const lastText = typeof (d.last_message ?? d.lastMessage) === "string" ? asStr(d.last_message ?? d.lastMessage) : asStr(last.content);
  const at = typeof d.updated_at === "string" ? d.updated_at : asStr(last.created_at) || asStr(d.created_at);
  return { id: String(d.id ?? d.chat_id ?? ""), title: asStr(d.title), lastMessage: lastText || undefined, updatedAt: at || undefined };
}
