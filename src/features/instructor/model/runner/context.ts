import { hideOverlay } from "../overlayStore";

export type RunCtx = { sessionId: string; message: string; answer: string; signal: AbortSignal; history: { q: string; a: string }[] };

let ctrl: AbortController | null = null;
let why = "superseded";

// One run at a time: a new answer, a new question or a logout cancels the previous one.
export function beginRun(): AbortController {
  abortRun("superseded");
  ctrl = new AbortController();
  return ctrl;
}

export function abortRun(reason = "superseded"): void {
  if (!ctrl) return;
  why = reason;
  ctrl.abort();
  ctrl = null;
  hideOverlay();
}

export const abortReason = (): string => why;
export const isRunning = (): boolean => ctrl !== null;

export const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        resolve();
      },
      { once: true },
    );
  });

export async function waitFor(pred: () => boolean, ms: number, signal: AbortSignal): Promise<boolean> {
  const end = Date.now() + ms;
  while (!pred()) {
    if (signal.aborted || Date.now() > end) return false;
    await sleep(100, signal);
  }
  return true;
}
