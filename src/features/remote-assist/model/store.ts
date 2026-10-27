import { create } from "zustand";
import type { RaSession } from "@/entities/remote-assist";
import { registerSessionReset } from "@/shared/lib/sessionReset";

export type RaEnd = "ended" | "revoked" | "expired" | "denied";
export type RaBusy = "" | "accept" | "deny" | "pause" | "resume" | "revoke" | "end";

type State = {
  request: RaSession | null; // the consent request on screen
  more: number; // further requests waiting behind it
  session: RaSession | null; // consented: active or paused
  ended: { status: RaEnd; seq: number } | null; // the terminal message after deny / revoke / end / expiry
  busy: RaBusy;
  failed: boolean; // the consent answer did not go through
};

const EMPTY: State = { request: null, more: 0, session: null, ended: null, busy: "", failed: false };

// What the remote-assistance layer shows. The session machinery (socket, queue, publisher) lives in runtime.ts.
export const useRaStore = create<State>(() => EMPTY);

let seq = 0;
export const showEnded = (status: RaEnd): void => useRaStore.setState({ ended: { status, seq: ++seq } });
export const hideEnded = (): void => useRaStore.setState({ ended: null });

registerSessionReset(() => useRaStore.setState(EMPTY));
