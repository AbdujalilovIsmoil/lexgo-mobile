import { create } from "zustand";
import { registerSessionReset } from "@/shared/lib/sessionReset";

type State = { dismissed: string[]; dismiss: (workId: string) => void };

// Works whose "rate this" banner the user closed; kept for this app session only.
export const usePromptStore = create<State>((set) => ({
  dismissed: [],
  dismiss: (workId) => set((s) => ({ dismissed: [...s.dismissed, workId] })),
}));

registerSessionReset(() => usePromptStore.setState({ dismissed: [] }));
