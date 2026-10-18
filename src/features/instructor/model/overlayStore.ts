import { create } from "zustand";

export type StepMode = "highlight" | "tooltip";
export type OverlayStep = { id: string; targetId: string; caption: string; mode: StepMode; index: number; total: number; holdMs: number };
export type StepOutcome = "next" | "stop" | "timeout";

export const useOverlay = create<{ step: OverlayStep | null }>(() => ({ step: null }));

let resolver: ((o: StepOutcome) => void) | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

// Show one guided step and wait for the user (Next / Stop / tap) or for its hold time to pass.
export function showStep(step: OverlayStep): Promise<StepOutcome> {
  finishStep("stop");
  useOverlay.setState({ step });
  return new Promise((resolve) => {
    resolver = resolve;
    timer = setTimeout(() => finishStep("timeout"), step.holdMs);
  });
}

export function finishStep(outcome: StepOutcome): void {
  clearTimeout(timer);
  const done = resolver;
  resolver = null;
  done?.(outcome);
}

export function hideOverlay(): void {
  finishStep("stop");
  useOverlay.setState({ step: null });
}
