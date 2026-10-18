import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { AuditEntry, AuditFilters, SecurityEvent } from "../model/types";

const firstStr = (...vals: unknown[]) => vals.map((v) => (typeof v === "string" ? v.trim() : "")).find(Boolean) ?? "";

function normEntry(v: unknown): AuditEntry {
  const d = asDict(v);
  const chain = asDict(d.chain ?? d.integrity);
  return {
    id: asStr(d.id),
    action: asStr(d.action ?? d.type ?? d.event),
    detail: asStr(d.detail ?? d.description ?? d.message ?? (typeof d.details === "string" ? d.details : undefined)),
    titleUz: asStr(d.title_uz),
    descriptionUz: asStr(d.description_uz),
    ip: asStr(d.ip ?? d.ip_address),
    createdAt: asStr(d.created_at ?? d.createdAt ?? d.timestamp),
    previousHash: firstStr(d.previous_hash, d.prev_hash, d.previousHash, chain.previous_hash),
    eventHash: firstStr(d.event_hash, d.hash, d.eventHash, chain.event_hash),
    userId: asStr(d.user_id),
    targetType: asStr(d.target_type),
    targetId: asStr(d.target_id),
    outcome: asStr(d.outcome),
  };
}

// date_from / date_to (inclusive YYYY-MM-DD), user_id, action, target_type, target_id.
export function auditQuery(f: AuditFilters, extra: Record<string, string> = {}): string {
  const q = new URLSearchParams();
  const put = (k: string, v: string) => v.trim() && q.set(k, v.trim());
  put("date_from", f.dateFrom); put("date_to", f.dateTo); put("user_id", f.userId);
  put("action", f.action); put("target_type", f.targetType); put("target_id", f.targetId);
  Object.entries(extra).forEach(([k, v]) => q.set(k, v));
  return q.toString();
}

// GET /admin/audit-trail — the whole filtered log (the endpoint has no paging), newest first.
export async function listAudit(f: AuditFilters): Promise<AuditEntry[]> {
  const qs = auditQuery(f);
  return listFrom(await http(`/admin/audit-trail${qs ? `?${qs}` : ""}`), "items", "data", "logs", "records", "entries", "events").map(normEntry);
}

// Path of the CSV export of the same filtered rows (the backend logs every export).
export const auditCsvPath = (f: AuditFilters) => `/admin/audit-trail?${auditQuery(f, { export: "csv" })}`;

// GET /admin/security-events[?status=] — anomaly alerts (suspicious login, brute force …).
export async function listSecurityEvents(status: string): Promise<SecurityEvent[]> {
  const qs = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
  return listFrom(await http(`/admin/security-events${qs}`), "items", "data").map((x) => {
    const d = asDict(x);
    const p = asDict(d.payload);
    return { id: asStr(d.id), type: asStr(d.record_type), title: asStr(d.title), status: asStr(d.status, "new"), ownerUserId: asStr(d.owner_user_id), previousIp: asStr(p.previous_ip), currentIp: asStr(p.current_ip), createdAt: asStr(d.created_at) };
  });
}
