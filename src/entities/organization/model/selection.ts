import { create } from "zustand";
import { readJson, writeJson } from "@/shared/lib/storage";
import { registerSessionReset } from "@/shared/lib/sessionReset";

const KEY = "lexgo.org.selected.";

type State = { uid: string; orgId: string; bind: (uid: string) => Promise<void>; select: (id: string) => void };

// Which of the owner's organizations the /org screens work on, remembered per user. The caller
// always validates it against the owner's own list, so a stale id can never reach the API.
export const useOrgSelection = create<State>((set, get) => ({
  uid: "",
  orgId: "",
  bind: async (uid) => {
    set({ uid, orgId: "" });
    const saved = await readJson<string>(KEY + uid);
    if (saved && get().uid === uid && !get().orgId) set({ orgId: saved });
  },
  select: (orgId) => {
    set({ orgId });
    if (get().uid) void writeJson(KEY + get().uid, orgId);
  },
}));

registerSessionReset(() => useOrgSelection.setState({ uid: "", orgId: "" }));
