export type StackPlan = { shown: number; extra: number };

/** How many avatars an overlapping stack draws: all when they fit in `max` slots, else `max - 1` plus a "+N" bubble. */
export function stackPlan(count: number, max = 5): StackPlan {
  const n = Math.max(0, Math.floor(count));
  const slots = Math.max(1, Math.floor(max));
  if (n <= slots) return { shown: n, extra: 0 };
  return { shown: slots - 1, extra: n - (slots - 1) };
}

/** Overlap in px between neighbours: about a third of the avatar, so the faces stay recognisable. */
export const stackOverlap = (size: number): number => Math.round(size * 0.32);

/** Total width of a stack of `slots` items (avatars + the bubble). */
export const stackWidth = (slots: number, size: number): number => (slots <= 0 ? 0 : size + (slots - 1) * (size - stackOverlap(size)));
