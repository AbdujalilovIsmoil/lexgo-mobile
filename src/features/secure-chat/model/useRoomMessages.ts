import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { SocketState } from "@/shared/realtime";
import { chatKeys, getMessages, setActiveRoom, type Msg, type Room } from "@/entities/secure-chat";
import { meetKeys } from "@/entities/call";
import { firstUnread, mergeMessages } from "./mergeMessages";
import { useRoomSocket } from "./useRoomSocket";

export type LoadState = "loading" | "ready" | "error";
const PAGE = 40; // the server returns the whole history; the phone shows the newest PAGE and reveals older ones on scroll

// Message list of one room: history over REST (react-query), live frames over the room socket merged into the
// cache, a quiet re-read to mark the room read, polling only while the socket is down. Unsent bubbles live in `outbox`.
export function useRoomMessages(roomId: string, myId: string) {
  const qc = useQueryClient();
  const key = chatKeys.messages(roomId);
  const [conn, setConn] = useState<SocketState>("connecting");
  const [outbox, setOutbox] = useState<Msg[]>([]);
  const [limit, setLimit] = useState(PAGE);
  const [unreadAtOpen] = useState(() => qc.getQueryData<Room[]>(chatKeys.rooms)?.find((r) => r.id === roomId)?.unread ?? 0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const q = useQuery({ queryKey: key, queryFn: () => getMessages(roomId), refetchInterval: conn === "offline" ? 10_000 : false });
  const { refetch } = q;
  const put = useCallback((m: Msg) => qc.setQueryData<Msg[]>(key, (prev) => mergeMessages(prev ?? [], [m])), [qc, key]);

  useRoomSocket(roomId, {
    onState: setConn,
    onOpen: (again) => { if (again) void refetch(); },
    onCall: () => void qc.invalidateQueries({ queryKey: meetKeys.room(roomId) }),
    onMessage: (m) => {
      put(m);
      // The room is open, so what others write counts as read: a quiet re-read marks it on the server.
      if (m.senderId !== myId) { clearTimeout(timer.current); timer.current = setTimeout(() => void refetch(), 1200); }
    },
  });
  useEffect(() => {
    const app = AppState.addEventListener("change", (s) => { if (s === "active") void refetch(); });
    return () => app.remove();
  }, [refetch]);
  useEffect(() => {
    setActiveRoom(roomId);
    qc.setQueryData<Room[]>(chatKeys.rooms, (rs) => rs?.map((r) => (r.id === roomId && r.unread ? { ...r, unread: 0 } : r)));
    return () => { setActiveRoom(""); clearTimeout(timer.current); void qc.invalidateQueries({ queryKey: chatKeys.rooms }); };
  }, [qc, roomId]);

  // A bubble whose socket echo already arrived is dropped from the outbox view (the REST answer follows).
  const all = useMemo(() => {
    const server = q.data ?? [];
    const echoed = (o: Msg) => server.some((m) => m.senderId === o.senderId && m.type === o.type && m.content === o.content && Date.parse(m.createdAt) >= Date.parse(o.createdAt) - 10_000);
    return mergeMessages(server, outbox.filter((o) => o.failed || !echoed(o)));
  }, [q.data, outbox]);
  const divider = useMemo(() => firstUnread(q.data ?? [], myId, unreadAtOpen), [q.data, myId, unreadAtOpen]);
  const msgs = useMemo(() => all.slice(-limit), [all, limit]);
  const state: LoadState = q.isLoading ? "loading" : q.isError && !q.data ? "error" : "ready";
  const reveal = useCallback((id: string) => setLimit((n) => Math.max(n, all.length - all.findIndex((m) => m.id === id) + 5)), [all]);
  return { msgs, all, state, error: q.error, conn, outbox, setOutbox, put, divider, hasOlder: all.length > limit, loadOlder: () => setLimit((n) => n + PAGE), reveal, reload: () => void refetch() };
}
