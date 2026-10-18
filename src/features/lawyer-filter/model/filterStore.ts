import { create } from "zustand";
import { defaultLawyerFilters, type LawyerFilters } from "@/entities/lawyer";

type State = {
  filters: LawyerFilters;
  set: (patch: Partial<LawyerFilters>) => void;
  reset: () => void;
  ai: boolean; // the search box talks to the AI search instead of filtering by name
  aiQuery: string; // the sentence last sent to POST /marketplace/ai-search
  setAi: (on: boolean) => void;
  runAi: (q: string) => void;
};

// Applied filters of the Lawyers tab (they survive tab switches). Each change
// becomes a new server query.
export const useLawyerFilterStore = create<State>((set) => ({
  filters: defaultLawyerFilters,
  set: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  reset: () => set({ filters: defaultLawyerFilters }),
  ai: false,
  aiQuery: "",
  setAi: (ai) => set({ ai }),
  runAi: (q) => set({ ai: true, aiQuery: q.trim() }),
}));
