import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerSessionReset } from "@/shared/lib/sessionReset";

// Local draft of a document being filled (TZ 12): answers + position, kept per
// user and service so a closed app or a failed call never loses typed text.
export type Draft = { answers: Record<string, string>; step: number; need?: string; at: number };

type State = {
  drafts: Record<string, Draft>;
  save: (key: string, d: Omit<Draft, "at">) => void;
  drop: (key: string) => void;
  clear: () => void;
};

const MAX = 30;
export const draftKey = (userId: string, mode: "manual" | "ai", serviceId: string): string => `${userId}:${mode}:${serviceId}`;
const hasText = (d: Omit<Draft, "at">) => Object.values(d.answers).some((v) => v.trim()) || !!d.need?.trim();

export const useDraftStore = create<State>()(
  persist(
    (set) => ({
      drafts: {},
      save: (key, d) =>
        set((s) => {
          const rest = { ...s.drafts };
          delete rest[key];
          if (!hasText(d)) return { drafts: rest };
          const keep = Object.entries({ ...rest, [key]: { ...d, at: Date.now() } }).sort((a, b) => b[1].at - a[1].at).slice(0, MAX);
          return { drafts: Object.fromEntries(keep) };
        }),
      drop: (key) => set((s) => ({ drafts: Object.fromEntries(Object.entries(s.drafts).filter(([k]) => k !== key)) })),
      clear: () => set({ drafts: {} }),
    }),
    { name: "lexgo_doc_drafts", storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ drafts: s.drafts }) },
  ),
);

// Drafts are personal data: gone on logout / user change.
registerSessionReset(() => useDraftStore.getState().clear());
