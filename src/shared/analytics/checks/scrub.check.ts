import { scrubProps } from "../scrub";
import { callQualityBucket, latencyBucket, sizeBucket } from "../buckets";

type Row = [name: string, input: Record<string, unknown>, expected: Record<string, unknown>];
const ROWS: Row[] = [
  ["keeps enum-like values", { screen: "chat/[roomId]", result: "opened", ok: true, attempt: 2 }, { screen: "chat/[roomId]", result: "opened", ok: true, attempt: 2 }],
  ["drops keys outside the allowlist", { phone: "+998901234567", name: "Aziz", text: "salom", token: "abc", url: "x" }, {}],
  ["drops a phone number under an allowed key", { reason: "+998901234567", status: "998901234567" }, {}],
  ["drops free text", { reason: "Salom, bu mening xabarim", action: "hello world" }, {}],
  ["drops e-mail, uuid, jwt, urls", { reason: "a@b.uz", source: "9e6f40ab-f072-45db-88bd-021daec54f6c", target: "eyJhbGciOiJIUzI1NiJ9", kind: "https://x.uz/f.pdf", step: "file:///a/b" }, {}],
  ["drops objects, arrays and NaN", { screen: { a: 1 }, count: [1], ms: NaN }, {}],
  ["rounds numbers", { ms: 12.3456 }, { ms: 12.35 }],
];

// Returns the failures of the PII scrubber and the bucket helpers (run: node scripts/check-infra.mjs).
export function runScrubChecks(): { total: number; failures: string[] } {
  const failures: string[] = [];
  for (const [name, input, expected] of ROWS) {
    const got = JSON.stringify(scrubProps(input));
    if (got !== JSON.stringify(expected)) failures.push(`${name}: ${got} != ${JSON.stringify(expected)}`);
  }
  const buckets: [string, string][] = [[latencyBucket(120), "lt200ms"], [latencyBucket(1500), "lt2s"], [latencyBucket(9000), "gte5s"], [sizeBucket(50_000), "lt100kb"], [sizeBucket(30_000_000), "gte20mb"], [callQualityBucket(0, 80), "good"], [callQualityBucket(3, 80), "fair"], [callQualityBucket(1, 700), "poor"]];
  for (const [got, want] of buckets) if (got !== want) failures.push(`bucket: ${got} != ${want}`);
  return { total: ROWS.length + buckets.length, failures };
}
