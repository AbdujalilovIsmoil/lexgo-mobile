import { create } from "zustand";
import type { ChatReply } from "@/entities/instructor";
import { registerSessionReset } from "@/shared/lib/sessionReset";

export type InstructorMsg = { id: string; role: "user" | "assistant"; text: string; reply?: ChatReply; failed?: boolean };

type ChatState = {
  messages: InstructorMsg[];
  sending: boolean;
  add: (m: InstructorMsg) => void;
  patch: (id: string, p: Partial<InstructorMsg>) => void;
  setSending: (v: boolean) => void;
  clear: () => void;
};

// The short assistant conversation (memory only; the backend keeps the session and its last answer).
export const useInstructorChat = create<ChatState>((set) => ({
  messages: [],
  sending: false,
  add: (m) => set((s) => ({ messages: [...s.messages.slice(-39), m] })),
  patch: (id, p) => set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, ...p } : m)) })),
  setSending: (sending) => set({ sending }),
  clear: () => set({ messages: [], sending: false }),
}));

registerSessionReset(() => useInstructorChat.getState().clear());

let seq = 0;
export const msgId = (): string => `m${Date.now().toString(36)}${(++seq).toString(36)}`;
