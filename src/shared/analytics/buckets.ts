// Coarse buckets instead of raw numbers: enough to see a trend, too coarse to identify a request.
const pick = (n: number, steps: [number, string][], top: string): string => steps.find(([max]) => n < max)?.[1] ?? top;

export const latencyBucket = (ms: number): string => pick(ms, [[200, "lt200ms"], [500, "lt500ms"], [1000, "lt1s"], [2000, "lt2s"], [5000, "lt5s"]], "gte5s");
export const sizeBucket = (bytes: number): string => pick(bytes, [[100_000, "lt100kb"], [1_000_000, "lt1mb"], [5_000_000, "lt5mb"], [20_000_000, "lt20mb"]], "gte20mb");
export const countBucket = (n: number): string => pick(n, [[1, "0"], [2, "1"], [4, "2-3"], [11, "4-10"]], "gt10");

/** Call quality from packet loss (%) and round-trip time (ms): good / fair / poor. */
export function callQualityBucket(lossPct: number, rttMs: number): "good" | "fair" | "poor" {
  if (lossPct > 8 || rttMs > 600) return "poor";
  return lossPct > 2 || rttMs > 250 ? "fair" : "good";
}
