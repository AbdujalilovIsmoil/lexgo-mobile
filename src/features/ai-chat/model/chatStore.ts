import { create } from "zustand";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import type { ChatLimit, ChatMessage, GuestLimit } from "@/entities/chat";
import { appendDelta, mergeServer, settleLocal, upsertMessage } from "./chatReducers";

type ChatState = {
  chatId: string | null;
  session: number; // bumps on every new/opened chat, so late replies of an old one are dropped
  messages: ChatMessage[];
  sending: boolean; // a question is waiting for its answer
  limit: GuestLimit | null; // guest quota echoed by the last successful reply
  limitErr: ChatLimit | null; // the server refused the last question (limit card)
  feedback: Record<string, "up" | "down">;
  setChat: (chatId: string | null, messages: ChatMessage[]) => void;
  append: (m: ChatMessage) => void;
  upsert: (m: ChatMessage) => void;
  patch: (id: string, p: Partial<ChatMessage>) => void;
  settle: (localId: string, server?: ChatMessage) => void;
  delta: (id: string, text: string) => void;
  merge: (server: ChatMessage[]) => void;
  setSending: (v: boolean) => void;
  setLimit: (l: GuestLimit | null) => void;
  setLimitErr: (l: ChatLimit | null) => void;
  setFeedback: (id: string, v: "up" | "down") => void;
  reset: () => void;
};

const awaiting = (list: ChatMessage[]) => list.length > 0 && list[list.length - 1].role === "user";

// The open AI conversation (one at a time), kept in memory across tab switches.
export const useChatStore = create<ChatState>((set) => ({
  chatId: null,
  session: 0,
  messages: [],
  sending: false,
  limit: null,
  limitErr: null,
  feedback: {},
  setChat: (chatId, messages) => set((s) => ({ chatId, messages, session: s.session + 1, sending: false, limitErr: null })),
  append: (m) => set((s) => ({ messages: [...s.messages, m] })),
  upsert: (m) => set((s) => ({ messages: upsertMessage(s.messages, m), sending: m.role === "assistant" ? false : s.sending })),
  patch: (id, p) => set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, ...p } : m)) })),
  settle: (localId, server) => set((s) => ({ messages: settleLocal(s.messages, localId, server) })),
  delta: (id, text) => set((s) => ({ messages: appendDelta(s.messages, id, text) })),
  merge: (server) =>
    set((s) => {
      const messages = mergeServer(s.messages, server);
      return { messages, sending: s.sending && awaiting(messages) };
    }),
  setSending: (sending) => set({ sending }),
  setLimit: (limit) => set({ limit }),
  setLimitErr: (limitErr) => set({ limitErr }),
  setFeedback: (id, v) => set((s) => ({ feedback: { ...s.feedback, [id]: v } })),
  reset: () => set((s) => ({ chatId: null, messages: [], sending: false, limitErr: null, session: s.session + 1 })),
}));

// Logout / another user or role: nothing of the previous conversation may remain (TZ 45.9).
registerSessionReset(() => useChatStore.setState((s) => ({ chatId: null, messages: [], sending: false, limit: null, limitErr: null, feedback: {}, session: s.session + 1 })));

// Going into the AI from a "new question" entry (the bar's AI button, Home's ask field…) starts an empty conversation; only the history
// opens an old one. The store outlives the screen, so without this the last chat came back.
export const freshAiChat = () => {
  const s = useChatStore.getState();
  if (s.chatId || s.messages.length) s.reset();
};
