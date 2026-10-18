import { useEffect, useRef } from "react";
import { useIsFocused } from "expo-router";
import { sameTarget } from "./aliases";

type Prefill = { set: (v: string) => void; label: string; sensitive: boolean };

const modals = new Map<string, () => void>();
const prefills = new Map<string, Prefill>();

const find = <T,>(m: Map<string, T>, id: string): T | undefined => m.get(id) ?? [...m].find(([k]) => sameTarget(k, id))?.[1];

// A sheet/dialog the assistant may open (`open_modal`). Returns the unregister function.
export function registerModal(id: string, open: () => void): () => void {
  modals.set(id, open);
  return () => void (modals.get(id) === open && modals.delete(id));
}

// A text field the assistant may pre-fill (`fill_form`) — always after the user approves the values.
// Mark secrets (password, OTP, card, PIN…) `sensitive`: they are never filled.
export function registerPrefill(id: string, set: (v: string) => void, opts: { label?: string; sensitive?: boolean } = {}): () => void {
  const entry: Prefill = { set, label: opts.label ?? id, sensitive: !!opts.sensitive };
  prefills.set(id, entry);
  return () => void (prefills.get(id) === entry && prefills.delete(id));
}

// Hook forms: registered while the screen is mounted AND in front, always calling the latest callback.
export function useInstructorModal(id: string, open: () => void): void {
  const ref = useRef(open);
  const front = useIsFocused();
  useEffect(() => {
    ref.current = open;
  });
  useEffect(() => (front && id ? registerModal(id, () => ref.current()) : undefined), [id, front]);
}

export function useInstructorPrefill(id: string, set: (v: string) => void, opts: { label?: string; sensitive?: boolean } = {}): void {
  const ref = useRef(set);
  const front = useIsFocused();
  const { label, sensitive } = opts;
  useEffect(() => {
    ref.current = set;
  });
  useEffect(() => (front && id ? registerPrefill(id, (v) => ref.current(v), { label, sensitive }) : undefined), [id, label, sensitive, front]);
}

export const openRegisteredModal = (id: string): boolean => {
  const fn = find(modals, id);
  fn?.();
  return !!fn;
};
export const findPrefill = (id: string): Prefill | undefined => find(prefills, id);
