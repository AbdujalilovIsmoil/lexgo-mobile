import { resolveLink, resolveUrl } from "../resolve";
import type { Resolution } from "../types";
import { EVENT_CASES, type Case, type Expect } from "./cases1";
import { MORE_CASES } from "./cases2";
import { URL_CASES } from "./urlCases";
import { V } from "./viewers";

function verify(name: string, r: Resolution, e: Expect): string | null {
  const kind = e.kind ?? "target";
  if (r.kind !== kind) return `${name}: expected ${kind}, got ${r.kind}${r.kind === "target" ? ` (${r.target.href})` : ""}`;
  if (r.kind === "blocked" && e.fallback && r.fallback !== e.fallback) return `${name}: fallback ${r.fallback} != ${e.fallback}`;
  if (r.kind !== "target") return null;
  const t = r.target;
  if (e.href && t.href !== e.href) return `${name}: href ${t.href} != ${e.href}`;
  if (e.fallback && t.fallback !== e.fallback) return `${name}: fallback ${t.fallback} != ${e.fallback}`;
  if (e.probe !== undefined && t.probe?.path !== e.probe) return `${name}: probe ${t.probe?.path} != ${e.probe}`;
  if (e.label && t.label !== e.label) return `${name}: label ${t.label} != ${e.label}`;
  return null;
}

// Table-driven checks of the link resolver; returns the failures (empty = all good).
// Run: node scripts/check-links.mjs
export function runChecks(): { total: number; failures: string[] } {
  const all: Case[] = [...EVENT_CASES, ...MORE_CASES];
  const failures: string[] = [];
  for (const [name, who, input, expect] of all) {
    const f = verify(name, resolveLink(input, V[who]), expect);
    if (f) failures.push(f);
  }
  for (const [name, who, url, expect] of URL_CASES) {
    const f = verify(name, resolveUrl(url, V[who]), expect);
    if (f) failures.push(f);
  }
  return { total: all.length + URL_CASES.length, failures };
}
