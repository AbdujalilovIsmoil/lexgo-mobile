import { create } from "zustand";
import type { RaAsk } from "./execTypes";

type Open = RaAsk & { seq: number };

export const useRaAsk = create<{ ask: Open | null }>(() => ({ ask: null }));

const WAIT_MS = 60_000;
let settle: ((ok: boolean) => void) | null = null;
let shown: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let seq = 0;

/**
 * Asks the client to confirm with their own tap (TZ RA §11). Resolves true only on "Roziman" / "Ko'rsatish"; "Yo'q", a minute without an
 * answer, a pause or the end of the session is a no. `onShown` runs once the sheet is on screen (the confirmation_required acknowledgement).
 */
export function askClient(a: RaAsk, onShown: () => void): Promise<boolean> {
  answerAsk(false);
  return new Promise((resolve) => {
    settle = resolve;
    shown = onShown;
    useRaAsk.setState({ ask: { ...a, seq: ++seq } });
    timer = setTimeout(() => answerAsk(false), WAIT_MS);
  });
}

/** The sheet of ask `n` is visible. */
export function askShown(n: number): void {
  if (n !== seq || !shown) return;
  const f = shown;
  shown = null;
  f();
}

export function answerAsk(ok: boolean): void {
  clearTimeout(timer);
  const s = settle;
  settle = null;
  shown = null;
  if (useRaAsk.getState().ask) useRaAsk.setState({ ask: null });
  s?.(ok);
}
