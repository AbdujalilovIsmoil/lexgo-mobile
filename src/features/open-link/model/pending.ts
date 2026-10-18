import { create } from "zustand";
import type { LinkInput } from "@/shared/links";

export type LinkRequest = { input: LinkInput } | { url: string };

// A link that arrived while signed out: kept in memory and opened right after sign-in.
type PendingState = { request: LinkRequest | null; set: (r: LinkRequest | null) => void };
export const usePendingLink = create<PendingState>((set) => ({ request: null, set: (request) => set({ request }) }));

export function takePending(): LinkRequest | null {
  const r = usePendingLink.getState().request;
  if (r) usePendingLink.getState().set(null);
  return r;
}
