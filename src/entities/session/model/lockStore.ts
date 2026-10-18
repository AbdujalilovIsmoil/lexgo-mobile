import { create } from "zustand";
import { readSecret, writeSecret } from "@/shared/lib/storage";

// App lock (TZ 1.3): tokens stay in SecureStore, a lock overlay hides the app until biometrics succeed.
// The setting is kept in SecureStore too (a tampered flag must not switch the lock off) and belongs
// to the account that enabled it.
const KEY = "lexgo_lock";
export const LOCK_TIMEOUTS = [0, 1, 5, 15] as const; // minutes in the background before the lock returns

type Saved = { owner: string; timeoutMin: number };
type LockState = {
  enabled: boolean;
  owner: string;
  timeoutMin: number;
  locked: boolean;
  enable: (owner: string, timeoutMin: number) => Promise<void>;
  setTimeoutMin: (m: number) => Promise<void>;
  disable: () => Promise<void>;
  lock: () => void;
  unlock: () => void;
};

export const useLockStore = create<LockState>((set, get) => ({
  enabled: false,
  owner: "",
  timeoutMin: 1,
  locked: false,
  enable: async (owner, timeoutMin) => {
    await writeSecret(KEY, JSON.stringify({ owner, timeoutMin } satisfies Saved));
    set({ enabled: true, owner, timeoutMin, locked: false });
  },
  setTimeoutMin: async (timeoutMin) => {
    if (!get().enabled) return;
    await writeSecret(KEY, JSON.stringify({ owner: get().owner, timeoutMin } satisfies Saved));
    set({ timeoutMin });
  },
  disable: async () => {
    await writeSecret(KEY, null);
    set({ enabled: false, owner: "", locked: false });
  },
  lock: () => get().enabled && set({ locked: true }),
  unlock: () => set({ locked: false }),
}));

// Cold start: the lock is on for the account that is still signed in.
export async function hydrateLock(userId: string): Promise<void> {
  try {
    const raw = await readSecret(KEY);
    const s = raw ? (JSON.parse(raw) as Partial<Saved>) : null;
    if (s?.owner && s.owner === userId) useLockStore.setState({ enabled: true, owner: s.owner, timeoutMin: Number(s.timeoutMin) || 0, locked: true });
    else if (s) await writeSecret(KEY, null);
  } catch {
    await writeSecret(KEY, null);
  }
}
