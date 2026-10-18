import type { Errors } from "../form/types";

// Server paths like "sections[0].title" → "sections.0.title" (the shape the editors look errors up by).
export function normErrors(errors: Errors): Errors {
  const out: Errors = {};
  for (const [k, v] of Object.entries(errors)) {
    const key = k.replace(/\[(\d+)\]/g, ".$1").replace(/^\./, "");
    if (!out[key]) out[key] = v;
  }
  return out;
}

// An error is stale once the field it points to was edited.
export function pruneErrors(errors: Errors, prev: Record<string, unknown>, next: Record<string, unknown>): Errors {
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const out: Errors = {};
  for (const [k, v] of Object.entries(errors)) {
    const root = k.split(".")[0];
    if (!same(prev[root], next[root])) continue;
    out[k] = v;
  }
  return Object.keys(out).length === Object.keys(errors).length ? errors : out;
}
