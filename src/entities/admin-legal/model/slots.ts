import { PLACEHOLDER_MAX, REQUIRED_SLUGS, type ConsentDoc, type DocSlot } from "./types";

// "1.10" > "1.9": compare the numeric segments.
export function cmpVersion(a: string, b: string): number {
  const pa = a.split(/[^0-9]+/).filter(Boolean).map(Number);
  const pb = b.split(/[^0-9]+/).filter(Boolean).map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

// "1.2" → "1.3"; anything else → "<v>.1".
export function bump(v: string): string {
  const m = /^(.*?)(\d+)$/.exec(v.trim());
  return m ? `${m[1]}${Number(m[2]) + 1}` : `${v}.1`;
}

// The required slugs first (published or not), then any other slug found; each with its versions (newest first).
export function buildSlots(docs: ConsentDoc[]): DocSlot[] {
  const by = new Map<string, ConsentDoc[]>();
  for (const d of docs) by.set(d.slug, [...(by.get(d.slug) ?? []), d]);
  by.forEach((v) => v.sort((a, b) => cmpVersion(b.version, a.version)));
  return [...REQUIRED_SLUGS, ...[...by.keys()].filter((s) => !REQUIRED_SLUGS.includes(s)).sort()].map((slug) => {
    const versions = by.get(slug) ?? [];
    const current = versions.find((d) => d.active) ?? versions[0];
    return { slug, versions, current, state: !current ? "missing" : current.body.length <= PLACEHOLDER_MAX ? "placeholder" : "ready" };
  });
}

// Required documents that have an active, real text.
export const readyCount = (docs: ConsentDoc[]) => REQUIRED_SLUGS.filter((s) => docs.some((d) => d.slug === s && d.active && d.body.length > PLACEHOLDER_MAX)).length;
