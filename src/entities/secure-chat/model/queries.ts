import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getReveal } from "../api/revealApi";
import { listRooms } from "../api/chatApi";
import { myRooms } from "./mine";
import { loadRooms, saveRooms } from "./roomsStore";
import type { Room } from "./types";

export const chatKeys = {
  all: ["secure-chat"] as const,
  rooms: ["secure-chat", "rooms"] as const,
  room: (roomId: string) => ["secure-chat", "room", roomId] as const,
  messages: (roomId: string) => ["secure-chat", "messages", roomId] as const,
  reveal: (roomId: string) => ["secure-chat", "reveal", roomId] as const,
  file: (messageId: string) => ["secure-chat", "file", messageId] as const,
};

// `live` = the user socket is up and keeps the list fresh; otherwise poll every 15 s. The last list is
// restored from disk first (stale on purpose, so the network answer still follows).
export function useRooms(live: boolean, userId = "") {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    void loadRooms(userId).then((cached) => {
      if (cached && !qc.getQueryData(chatKeys.rooms)) qc.setQueryData(chatKeys.rooms, cached, { updatedAt: 0 });
    });
  }, [qc, userId]);
  return useQuery({
    queryKey: chatKeys.rooms,
    queryFn: async (): Promise<Room[]> => {
      const rooms = await listRooms();
      if (userId) void saveRooms(userId, myRooms(rooms, userId));
      return rooms;
    },
    refetchInterval: live ? false : 15_000,
    enabled: userId !== "",
  });
}

export const useReveal = (roomId: string) => useQuery({ queryKey: chatKeys.reveal(roomId), queryFn: () => getReveal(roomId), staleTime: 30_000 });
