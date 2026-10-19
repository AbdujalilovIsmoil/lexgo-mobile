import { create } from "zustand";

// Whether the animated intro is still on screen. What opens by itself at start — the sign-in screen after an expired
// session, a link that needs signing in — waits for it: on iOS a modal screen is presented ABOVE the intro, so the
// sign-in form appeared before the splash had finished.
type Splash = { done: boolean; finish: () => void };

export const useSplash = create<Splash>((set) => ({
  done: false,
  finish: () => set({ done: true }),
}));
