import { InteractionManager } from "react-native";

// React Native runs all app JavaScript on ONE thread. There is no Web Worker: react-native-worklets / Reanimated
// worklets only run small functions marked "worklet" (no app modules, no fetch, no SQLite), so they cannot host
// arbitrary heavy code. What we do instead: (1) heavy native work stays in native modules (pdf-pages, document
// scanner, expo-file-system, expo-sqlite run off the JS thread), (2) pure-JS loops are cut into slices that yield to
// the event loop so touches and animations keep running, and (3) non-urgent jobs wait for running animations.

/** Lets pending touches/layout run (a macrotask turn). */
export const yieldToUi = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** Resolves once current animations/gestures have finished (use before starting non-urgent work). */
export const whenIdle = (): Promise<void> => new Promise((resolve) => void InteractionManager.runAfterInteractions(() => resolve()));

/**
 * Maps `items` through `fn` in slices of at most `budgetMs` of continuous JS time, yielding between slices.
 * Order is preserved. `shouldStop` lets the caller abort (screen closed, background time nearly up).
 */
export async function mapInChunks<T, R>(items: readonly T[], fn: (item: T, index: number) => R, opts: { budgetMs?: number; shouldStop?: () => boolean; now?: () => number } = {}): Promise<R[]> {
  const budget = opts.budgetMs ?? 12;
  const now = opts.now ?? Date.now;
  const out: R[] = [];
  let sliceStart = now();
  for (let i = 0; i < items.length; i += 1) {
    if (opts.shouldStop?.()) break;
    out.push(fn(items[i], i));
    if (now() - sliceStart >= budget) {
      await yieldToUi();
      sliceStart = now();
    }
  }
  return out;
}
