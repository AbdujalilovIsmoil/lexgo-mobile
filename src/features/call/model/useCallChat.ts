import { useCallback, useRef, useState } from "react";
import type { Room } from "livekit-client";

export type ChatMsg = { id: string; from: string; text: string; at: number; mine: boolean };
const MAX = 200;

// In-call chat rides the LiveKit data channel ({"t":"chat","text","at"}, the same frames the web room
// sends and reads) — nothing is stored on the server.
export function useCallChat(myId: string) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [unread, setUnread] = useState(0);
  const open = useRef(false);
  const add = (m: ChatMsg) => setMsgs((p) => [...p.slice(-MAX), m]);
  const onData = useCallback((payload: Uint8Array, from?: { identity: string }) => {
    try {
      const m = JSON.parse(new TextDecoder().decode(payload)) as { t?: string; text?: string; at?: number };
      if (m.t !== "chat" || !m.text) return;
      const at = m.at ?? Date.now();
      add({ id: `${from?.identity ?? "x"}-${at}`, from: from?.identity ?? "", text: m.text, at, mine: false });
      if (!open.current) setUnread((n) => n + 1);
    } catch { /* not a chat frame */ }
  }, []);
  const send = (room: Room | null, text: string) => {
    const body = text.trim();
    if (!room || !body) return;
    const at = Date.now();
    room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ t: "chat", text: body, at })), { reliable: true }).catch(() => undefined);
    add({ id: `me-${at}`, from: myId, text: body, at, mine: true });
  };
  const setOpen = useCallback((v: boolean) => { open.current = v; if (v) setUnread(0); }, []);
  return { msgs, unread, onData, send, setOpen };
}
