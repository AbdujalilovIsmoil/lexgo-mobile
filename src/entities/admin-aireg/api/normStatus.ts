import type { RStatus } from "../model/types";

const ACTIVE = ["active", "published", "enabled", "live", "current", "on"];
const ARCHIVED = ["archived", "archive", "inactive", "disabled", "deprecated", "off", "deleted"];

export function normStatus(v: unknown, active?: unknown): RStatus {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (ACTIVE.includes(s)) return "active";
  if (ARCHIVED.includes(s)) return "archived";
  if (s) return "draft";
  return active === false ? "archived" : "active";
}

export const knownStatus = (raw: string) => !raw.trim() || [...ACTIVE, ...ARCHIVED, "draft"].includes(raw.trim().toLowerCase());
