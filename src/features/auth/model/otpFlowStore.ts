import { create } from "zustand";
import type { OtpChallenge, RegisterInput } from "@/entities/session";
import { registerSessionReset } from "@/shared/lib/sessionReset";

export type OtpPurpose = "register" | "login2fa" | "reset";

export type OtpFlow = {
  purpose: OtpPurpose;
  challenge: OtpChallenge;
  phone: string;
  register?: RegisterInput; // register: asks a new code for the same details
  password?: string; // login2fa: a new code = signing in again (memory only, never stored)
  totp?: boolean; // authenticator code: nothing to resend
};

type State = {
  flow: OtpFlow | null;
  start: (flow: OtpFlow) => void;
  update: (challenge: OtpChallenge) => void;
  clear: () => void;
};

// Carries the pending OTP challenge between the form screen and the OTP screen. Lives in memory
// only (it can hold the password for a re-login) and is dropped on every sign-out.
export const useOtpFlow = create<State>((set) => ({
  flow: null,
  start: (flow) => set({ flow }),
  update: (challenge) => set((s) => (s.flow ? { flow: { ...s.flow, challenge } } : s)),
  clear: () => set({ flow: null }),
}));

registerSessionReset(() => useOtpFlow.getState().clear());
