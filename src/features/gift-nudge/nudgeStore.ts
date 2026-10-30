import { create } from "zustand";
import { registerSessionReset } from "@/shared/lib/sessionReset";

type State = { dismissed: string[]; dismiss: (key: string) => void };

// Web keeps this in sessionStorage; here it lives for the app session: a banner closed on its page stays closed there until the next start.
export const useNudgeStore = create<State>((set) => ({ dismissed: [], dismiss: (key) => set((s) => ({ dismissed: [...s.dismissed, key] })) }));
registerSessionReset(() => useNudgeStore.setState({ dismissed: [] }));
