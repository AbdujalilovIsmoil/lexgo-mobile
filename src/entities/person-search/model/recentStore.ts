import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import { mergeRecent } from "../lib/arrange";
import type { Person } from "./usePeople";

type RecentState = { list: Person[]; remember: (picked: Person[]) => void };

// People picked in a multi-select picker, newest first; offered again when the search field is empty. Per device.
export const useRecentPeople = create<RecentState>()(
  persist(
    (set) => ({ list: [], remember: (picked) => set((s) => ({ list: mergeRecent(s.list, picked) })) }),
    { name: "lexgo_recent_people", storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ list: s.list }) },
  ),
);

registerSessionReset(() => useRecentPeople.setState({ list: [] })); // names and phones of one account are not offered to the next
