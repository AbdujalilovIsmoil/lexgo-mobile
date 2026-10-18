import { create } from "zustand";
import { readJson, writeJson } from "@/shared/lib/storage";
import { registerSessionReset } from "@/shared/lib/sessionReset";

const KEY = "pay_autorenew";

type State = { flags: Record<string, boolean>; remember: (id: string, on: boolean) => void };

// The backend answers PATCH /subscriptions/{id}/auto-renew with the new flag but has no GET for it,
// so the last answer per subscription is remembered on the device (cleared with the session).
export const useAutoRenewStore = create<State>((set, get) => ({
  flags: {},
  remember: (id, on) => {
    const flags = { ...get().flags, [id]: on };
    set({ flags });
    void writeJson(KEY, flags);
  },
}));

void readJson<Record<string, boolean>>(KEY).then((flags) => flags && useAutoRenewStore.setState({ flags }));
registerSessionReset(() => {
  useAutoRenewStore.setState({ flags: {} });
  void writeJson(KEY, null);
});
