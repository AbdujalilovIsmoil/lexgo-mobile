import type { Reglament } from "./types";

export function parseVersion(v: string): [number, number, number] | null {
  const m = /^v?(\d{1,6})(?:\.(\d{1,6}))?(?:\.(\d{1,6}))?$/i.exec((v || "").trim());
  return m ? [parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 0, m[3] ? parseInt(m[3], 10) : 0] : null;
}

export function compareVersions(a: string, b: string): number {
  const x = parseVersion(a);
  const y = parseVersion(b);
  if (!x || !y) return x ? 1 : y ? -1 : 0;
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

export const isVersionFormat = (v: string) => /^\d{1,3}\.\d{1,3}$/.test(v.trim());

export function nextVersion(v: string, kind: "minor" | "major" = "minor"): string {
  const p = parseVersion(v);
  if (!p) return "1.0";
  return kind === "major" ? `${p[0] + 1}.0` : `${p[0]}.${p[1] + 1}`;
}

export function latestVersion(r: Pick<Reglament, "version" | "versions">): string {
  const all = [r.version, ...r.versions.map((x) => x.version)].filter((v) => parseVersion(v));
  return all.sort((a, b) => compareVersions(b, a))[0] ?? r.version;
}

// "format" = not like 1.0; "low" = not above the current version.
export function versionProblem(value: string, current: string): "format" | "low" | null {
  if (!isVersionFormat(value)) return "format";
  return current && parseVersion(current) && compareVersions(value, current) <= 0 ? "low" : null;
}

export const cleanVersion = (v: string) => v.replace(/,/g, ".").replace(/[^\d.]/g, "").replace(/\.{2,}/g, ".").slice(0, 7);

export const CUSTOM = "__custom";
export function catChoiceOf(category: string): { choice: string; custom: string } {
  const c = category.trim().toLowerCase();
  if (!c) return { choice: "support", custom: "" };
  return ["support", "payment", "marketplace", "documents", "urgent", "other"].includes(c) ? { choice: c, custom: "" } : { choice: CUSTOM, custom: category.trim() };
}
export const catValue = (choice: string, custom: string) => (choice === CUSTOM ? custom.trim().toLowerCase().replace(/\s+/g, "_") : choice);
