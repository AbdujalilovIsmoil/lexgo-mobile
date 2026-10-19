import { ruleFor } from "./persistRules";

// Which saved query snapshots are read back at start, and in what slices. Pure (no SQLite), so the limits are tested.
export type KeyRow = { key: string; bytes: number; updatedAt: number };
export type RestoreItem = { row: string; key: readonly unknown[]; bytes: number };

export const RESTORE_LIMITS = {
  rows: 160, // snapshots restored at most (the newest first)
  bytes: 6_000_000, // JSON text restored at most: parsing is the expensive part on a slow Android phone
  sliceBytes: 200_000, // JSON parsed between two yields to the UI thread (~a few ms on a mid-range phone)
  sliceRows: 8,
};

/** Newest-first rows → the snapshots worth restoring (allowed, not already in memory), cut into small slices. */
export function planRestore(rows: readonly KeyRow[], prefix: string, inMemory: (key: readonly unknown[]) => boolean, limits = RESTORE_LIMITS): RestoreItem[][] {
  const slices: RestoreItem[][] = [];
  let slice: RestoreItem[] = [];
  let sliceBytes = 0;
  let total = 0;
  let count = 0;
  for (const r of rows) {
    if (count >= limits.rows) break;
    if (!r.key.startsWith(prefix)) continue;
    let key: unknown;
    try {
      key = JSON.parse(r.key.slice(prefix.length));
    } catch {
      continue;
    }
    if (!Array.isArray(key) || !ruleFor(key) || inMemory(key)) continue;
    if (total + r.bytes > limits.bytes) continue; // a huge one is skipped, smaller older ones may still fit
    total += r.bytes;
    count += 1;
    if (slice.length && (slice.length >= limits.sliceRows || sliceBytes + r.bytes > limits.sliceBytes)) {
      slices.push(slice);
      slice = [];
      sliceBytes = 0;
    }
    slice.push({ row: r.key, key, bytes: r.bytes });
    sliceBytes += r.bytes;
  }
  if (slice.length) slices.push(slice);
  return slices;
}
