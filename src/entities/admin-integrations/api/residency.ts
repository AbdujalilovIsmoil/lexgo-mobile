import { asDict, type Dict } from "@/shared/lib/json";
import type { Residency } from "../model/types";

const scalar = (x: unknown) => (typeof x === "string" || typeof x === "number" || typeof x === "boolean" ? String(x).trim() : "");

// Same rules as the web: only an explicit confirmation counts; "configured / healthy"
// only means the report exists, and anything that asks for evidence stays pending.
export function normResidency(v: unknown): Residency | null {
  if (v == null || v === "") return null;
  const d: Dict = typeof v === "object" ? asDict(v) : { status: v };
  const status = scalar(d.status ?? d.state).toLowerCase();
  const flag = d.confirmed ?? d.is_confirmed ?? d.verified ?? d.evidence_confirmed;
  const needsEvidence = d.evidence_required === true || d.requires_evidence === true || /pending|evidence|required|planned|unverified|not_confirmed/.test(status);
  const confirmed = !needsEvidence && flag !== false && flag !== "false" && (flag === true || flag === "true" || ["confirmed", "verified", "compliant"].includes(status));
  const present = Boolean(status) || flag != null || Object.keys(d).length > 0;
  return {
    state: confirmed ? "confirmed" : present ? "pending" : "unknown",
    status,
    region: scalar(d.region ?? d.country ?? d.location ?? d.data_center_country),
    provider: scalar(d.provider ?? d.hosting_provider ?? d.data_center),
    checkedAt: scalar(d.checked_at ?? d.verified_at ?? d.updated_at),
  };
}
