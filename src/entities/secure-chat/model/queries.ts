import { useQuery } from "@tanstack/react-query";
import { listRooms } from "../api/chatApi";
import "./legacyRooms";
import type { Room } from "./types";

export const chatKeys = {
  all: ["secure-chat"] as const,
  rooms: ["secure-chat", "rooms"] as const,
  room: (roomId: string) => ["secure-chat", "room", roomId] as const,
  messages: (roomId: string) => ["secure-chat", "messages", roomId] as const,
  file: (messageId: string) => ["secure-chat", "file", messageId] as const,
};

// `live` = the user socket is up and keeps the list fresh; otherwise poll every 15 s. The last list comes back from the device's
// snapshot at start (persistRules), so the inbox paints at once and the network answer follows.
export function useRooms(live: boolean, userId = "") {
  return useQuery({
    queryKey: chatKeys.rooms,
    queryFn: (): Promise<Room[]> => listRooms(),
    refetchInterval: live ? false : 15_000,
    enabled: userId !== "",
  });
}

