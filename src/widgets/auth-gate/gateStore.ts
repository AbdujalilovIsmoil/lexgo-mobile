import { create } from "zustand";
import { registerSessionReset } from "@/shared/lib/sessionReset";

// "Continue to the app" on the soft (pending approval) gate lasts until the account state changes.
type State = { dismissed: string; dismiss: (key: string) => void };
export const useGateStore = create<State>((set) => ({ dismissed: "", dismiss: (dismissed) => set({ dismissed }) }));
registerSessionReset(() => useGateStore.setState({ dismissed: "" }));
