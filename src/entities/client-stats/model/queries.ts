import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatKeys, listRooms, type Room } from "@/entities/secure-chat";
import { useIsAuthed, useSession } from "@/entities/session";
import { listPayments } from "../api/statsApi";
import type { ChatRoom } from "./types";

export const statsKeys = {
  all: ["client-stats"] as const,
  payments: ["client-stats", "payments"] as const,
};

const STALE = 30 * 1000;

export function usePayments() {
  const authed = useIsAuthed();
  return useQuery({ queryKey: statsKeys.payments, queryFn: listPayments, enabled: authed, staleTime: STALE });
}

// The client's chats with unread counters: a view of the app's one chat list (GET /secure-chats, kept live by the user socket), not a
// second request for it.
const chatRoomOf = (r: Room, myId: string): ChatRoom => {
  const peer = r.members.find((m) => m.userId !== myId);
  return { id: r.id, unread: r.unread, peerName: peer?.name ?? "", peerRole: peer?.role ?? "", lastText: r.last?.content ?? "", lastAt: r.updatedAt, status: r.status };
};

export function useChatRooms() {
  const myId = useSession()?.user.id ?? "";
  const select = useCallback((rooms: Room[]) => rooms.map((r) => chatRoomOf(r, myId)), [myId]);
  return useQuery({ queryKey: chatKeys.rooms, queryFn: listRooms, enabled: !!myId, staleTime: STALE, select });
}

