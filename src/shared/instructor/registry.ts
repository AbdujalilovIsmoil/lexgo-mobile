import { sameTarget } from "./aliases";
import type { TargetEntry } from "./types";

const targets = new Map<string, TargetEntry>();
const listeners = new Set<() => void>();
let version = 0;

const bump = () => {
  version += 1;
  listeners.forEach((fn) => fn());
};

// Add an element to the map while it is mounted; the returned function removes it again.
export function registerTarget(entry: TargetEntry): () => void {
  targets.set(entry.id, entry);
  bump();
  return () => {
    if (targets.get(entry.id) !== entry) return;
    targets.delete(entry.id);
    bump();
  };
}

export const allTargets = (): TargetEntry[] => [...targets.values()];
export const targetsVersion = () => version;

export function subscribeTargets(fn: () => void): () => void {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

// Exact id first, then any element whose id is an alias of (or aliased by) the requested one.
export function findTarget(id: string): TargetEntry | null {
  return targets.get(id) ?? allTargets().find((t) => sameTarget(t.id, id)) ?? null;
}
