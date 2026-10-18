import { create } from "zustand";
import { runSessionReset } from "@/shared/lib/sessionReset";
import { hydrateLock, useLockStore } from "./lockStore";
import { readSession, wipeSession, writeSession, writeSid, writeTokens, writeUser } from "./persist";
import type { Session, User } from "./types";

type SessionState = {
  session: Session | null;
  ready: boolean;
  notice: "sessionExpired" | null;
  hydrate: () => Promise<void>;
  signIn: (s: Session) => Promise<void>;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
  setUser: (u: User) => Promise<void>;
  setSessionId: (sid: string) => Promise<void>;
  signOut: (expired?: boolean) => Promise<void>;
  clearNotice: () => void;
};

export const useSessionStore = create<SessionState>((set, get) => {
  // Patch the live session (and its storage) — a no-op when nobody is signed in. Re-reads the state
  // after the write: a sign-out that landed meanwhile must not leave tokens behind.
  const patch = async (change: Partial<Session>, save: () => Promise<unknown>) => {
    if (!get().session) return;
    await save();
    const cur = get().session;
    if (cur) set({ session: { ...cur, ...change } });
    else await wipeSession();
  };
  return {
    session: null,
    ready: false,
    notice: null,
    hydrate: async () => {
      const session = await readSession();
      await hydrateLock(session?.user.id ?? ""); // before `ready`, so the lock is up on the first frame
      set({ session, ready: true });
    },
    signIn: async (s) => {
      const lock = useLockStore.getState();
      if (lock.enabled && lock.owner !== s.user.id) await lock.disable(); // another account: the old lock is not theirs
      await writeSession({ ...s, sid: undefined });
      set({ session: { ...s, sid: undefined }, notice: null });
    },
    setTokens: (token, refreshToken) => patch({ token, refreshToken }, () => writeTokens(token, refreshToken)),
    setUser: (user) => patch({ user }, () => writeUser(user)),
    setSessionId: (sid) => patch({ sid }, () => writeSid(sid)),
    // `expired`: the server ended the session (the lock setting survives so the next sign-in of the
    // same account keeps it). A deliberate sign-out also drops the lock.
    signOut: async (expired) => {
      await wipeSession();
      if (!expired) await useLockStore.getState().disable();
      useLockStore.getState().unlock();
      set({ session: null, notice: expired ? "sessionExpired" : null });
      runSessionReset();
    },
    clearNotice: () => set({ notice: null }),
  };
});

export const useSession = () => useSessionStore((s) => s.session);
export const useIsAuthed = () => useSessionStore((s) => !!s.session);
