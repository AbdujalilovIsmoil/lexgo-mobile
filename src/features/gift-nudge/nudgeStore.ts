import { create } from "zustand";
import { registerSessionReset } from "@/shared/lib/sessionReset";

type State = { dismissed: boolean; picked: string; dismiss: () => void; ensure: (keys: string[]) => void };

// Web keeps this in sessionStorage; here it lives for the app session (picked once, dismissed once).
export const useNudgeStore = create<State>((set) => ({ dismissed: false, picked: "", dismiss: () => set({ dismissed: true }), ensure: (keys) => set((s) => (keys.includes(s.picked) ? s : { picked: keys[Math.floor(Math.random() * keys.length)] ?? "" })) }));
registerSessionReset(() => useNudgeStore.setState({ dismissed: false, picked: "" }));
