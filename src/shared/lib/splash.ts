import { create } from "zustand";

// Whether the animated intro is still on screen. What opens by itself at start — the sign-in screen after an expired
// session, a link that needs signing in — waits for it: on iOS a modal screen is presented ABOVE the intro, so the
// sign-in form appeared before the splash had finished.
// `quick`: the app was opened to show something (a link, a notification tap), so the intro steps aside as soon as the app is ready.
type Splash = { done: boolean; quick: boolean; finish: () => void; hurry: () => void };

export const useSplash = create<Splash>((set) => ({
  done: false,
  quick: false,
  finish: () => set({ done: true }),
  hurry: () => set({ quick: true }),
}));
