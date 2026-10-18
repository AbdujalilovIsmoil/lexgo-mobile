import { humanizeSlug } from "@/shared/lib/format";
import type { Lead, Operator } from "./types";

type T = (key: string, p?: Record<string, string | number>) => string;

// Translation of a raw backend value under `ns`, or "" when there is none.
function known(t: T, ns: string, raw: string): string {
  const path = `${ns}.${raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;
  const text = t(path);
  return text === path ? "" : text;
}

export const sourceLabel = (t: T, v: string) => (v ? known(t, "admLeadsB.source", v) || humanizeSlug(v) : "");
export const categoryLabel = (t: T, v: string) => (v ? known(t, "admLeadsB.cat", v) || humanizeSlug(v) : "");
export const regionLabel = (t: T, v: string) => (v ? known(t, "admLeadsB.region", v) || v : "");
export const urgencyLabel = (t: T, v: string) => (v ? known(t, "admLeadsB.urgency", v) || humanizeSlug(v) : "");
export const scoreLabel = (t: T, v: string) => (v ? known(t, "admLeadsB.score", v) || humanizeSlug(v) : "");

// A column still carrying the backend's default English title gets the translated stage name;
// a title somebody renamed stays as written.
export function columnTitle(t: T, c: { key: string; title: string }): string {
  const plain = c.title.trim().toLowerCase();
  const isDefault = !plain || plain === c.key.replace(/_/g, " ").toLowerCase();
  return (isDefault && known(t, "admLeads.stages", c.key)) || c.title || humanizeSlug(c.key);
}

export const leadTitle = (t: T, l: Lead): string => l.name || l.phone || categoryLabel(t, l.category) || t("admLeads.untitled");

// "you" for the signed-in user, the operator's name from the directory, else a plain "operator".
export function assigneeLabel(t: T, ops: Operator[], userId: string, meId: string): string {
  if (!userId) return t("admLeads.unassigned");
  if (meId && userId === meId) return t("admLeads.me");
  const o = ops.find((x) => x.id === userId);
  return (o && (o.name || o.phone)) || t("admLeads.operator");
}
