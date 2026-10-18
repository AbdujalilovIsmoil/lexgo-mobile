import { create } from "zustand";
import { readJson, writeJson } from "@/shared/lib/storage";
import { registerSessionReset } from "@/shared/lib/sessionReset";

const KEY = "lexgo_ai_instructor_sid";

type SessionState = { sessionId: string; hydrated: boolean; set: (id: string) => void; clear: () => void; hydrate: () => Promise<void> };

// The instructor session id survives app restarts (GET /ai/instructor/session/{id} restores the last answer)
// and is dropped on logout / user change.
export const useInstructorSession = create<SessionState>((set, get) => ({
  sessionId: "",
  hydrated: false,
  set: (sessionId) => {
    if (sessionId === get().sessionId) return;
    set({ sessionId });
    void writeJson(KEY, sessionId || null);
  },
  clear: () => {
    set({ sessionId: "" });
    void writeJson(KEY, null);
  },
  hydrate: async () => {
    if (get().hydrated) return;
    const saved = await readJson<string>(KEY);
    set({ hydrated: true, sessionId: get().sessionId || (typeof saved === "string" ? saved : "") });
  },
}));

registerSessionReset(() => useInstructorSession.getState().clear());
