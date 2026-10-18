import { create } from "zustand";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import { DEFAULT_POLICY } from "../lib/sharing";
import type { LocError, SharingPolicy, ShareMode } from "./types";

export type ShareState = {
  mode: ShareMode; // "unknown" until the user starts/stops in this app (the server has no read-back)
  manual: boolean; // "until switched off"
  until: number | null; // epoch ms the timed share ends
  policy: SharingPolicy;
  lastSentAt: number | null;
  lastAccuracy: number | null;
  error: LocError | null;
};

export const initialShare: ShareState = { mode: "unknown", manual: false, until: null, policy: DEFAULT_POLICY, lastSentAt: null, lastAccuracy: null, error: null };

export const useShareStore = create<ShareState>()(() => initialShare);

export const patchShare = (p: Partial<ShareState>) => useShareStore.setState(p);
export const resetShare = (mode: ShareMode = "unknown") => useShareStore.setState({ ...initialShare, mode });

// The in-app mirror belongs to the signed-in user.
registerSessionReset(() => resetShare("unknown"));
