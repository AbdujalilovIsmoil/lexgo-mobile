import { create } from "zustand";

// Whether the assistant sheet is open, and when the user last talked to it ("engaged" = worth syncing the
// screen to the backend, like the web's 10-minute window).
type UiState = { open: boolean; lastChat: number; setOpen: (v: boolean) => void; touch: () => void };

export const useInstructorUi = create<UiState>((set) => ({
  open: false,
  lastChat: 0,
  setOpen: (open) => set({ open }),
  touch: () => set({ lastChat: Date.now() }),
}));

export const openInstructor = () => useInstructorUi.getState().setOpen(true);
export const closeInstructor = () => useInstructorUi.getState().setOpen(false);
export const ENGAGED_MS = 10 * 60 * 1000;
