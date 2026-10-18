import { useSegments } from "expo-router";

// Screens that are not a module of their own (a chat room, a call, a ticket) keep the key of the parent area.
const ALIAS: Record<string, string> = { chat: "chats", call: "meetings" };

// "/manage/internal/org" → "internal". Empty outside the admin area.
export function useCurrentModule(): string {
  const seg = useSegments() as string[];
  if (seg[0] !== "manage" || !seg[1]) return "";
  return ALIAS[seg[1]] ?? seg[1];
}

// Full-screen routes (a live call, a chat room) hide the drawer handle.
export function useHideHandle(): boolean {
  const seg = useSegments() as string[];
  return seg[0] !== "manage" || seg[1] === "call" || seg[1] === "chat";
}
