import { create } from "zustand";

type Mark = { id: string; text: string; seq: number };

export const useRaMark = create<{ mark: Mark | null }>(() => ({ mark: null }));

let timer: ReturnType<typeof setTimeout> | undefined;
let seq = 0;

// The operator's outline (and note) on one control. It always ends: the ring is drawn for `ms` and then goes, never a loop.
export function showMark(id: string, text: string, ms: number): void {
  clearTimeout(timer);
  useRaMark.setState({ mark: { id, text, seq: ++seq } });
  timer = setTimeout(clearMark, ms);
}

export function clearMark(): void {
  clearTimeout(timer);
  if (useRaMark.getState().mark) useRaMark.setState({ mark: null });
}
