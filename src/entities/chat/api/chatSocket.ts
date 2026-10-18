import { ReconnectingSocket } from "@/shared/realtime";
import { WS_BASE } from "@/shared/config/env";
import { accessToken } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { normContracts, normMessage } from "./normalize";
import { normLimit } from "./normalizeLimit";
import type { ChatMessage, Contract, GuestLimit } from "../model/types";

// Frames of /ws/clients/{id}/chats/{chat}: message.created for both sides (observed live), plus
// defensive support for stream fragments that assemble into one assistant message (TZ 8).
export type ChatSocketEvent =
  | { kind: "message"; message: ChatMessage; contracts: Contract[]; limit?: GuestLimit }
  | { kind: "delta"; id: string; text: string; seq?: number };

const FRAGMENT = /(delta|chunk|fragment|stream|partial|token)/i;
const FINAL = /^message\.(created|completed|final|updated)$/;

export function parseChatEvent(raw: unknown): ChatSocketEvent | null {
  const d = asDict(raw);
  const name = asStr(d.event ?? d.type);
  const msg = asDict(d.message);
  if (FINAL.test(name) && msg.content !== undefined) {
    return { kind: "message", message: normMessage(msg), contracts: normContracts(d.contracts), limit: normLimit(d.limit_status) };
  }
  if (!FRAGMENT.test(name)) return null;
  const id = asStr(d.message_id ?? d.id ?? msg.id);
  const text = asStr(d.delta ?? d.chunk ?? d.fragment ?? d.token ?? d.text ?? d.content ?? msg.content);
  return id && text ? { kind: "delta", id, text, seq: typeof d.seq === "number" ? d.seq : undefined } : null;
}

type Handlers = { onEvent: (e: ChatSocketEvent) => void; onOpen: (again: boolean) => void };

// One socket per open chat; the token is read on every attempt, so a refreshed one is picked up.
export function createChatSocket(clientId: string, chatId: string, h: Handlers): ReconnectingSocket {
  return new ReconnectingSocket({
    url: () => {
      const tok = accessToken();
      return `${WS_BASE}/ws/clients/${clientId}/chats/${chatId}${tok ? `?token=${encodeURIComponent(tok)}` : ""}`;
    },
    onMessage: (raw) => {
      const e = parseChatEvent(raw);
      if (e) h.onEvent(e);
    },
    onOpen: h.onOpen,
    pingMs: 25_000,
  });
}
