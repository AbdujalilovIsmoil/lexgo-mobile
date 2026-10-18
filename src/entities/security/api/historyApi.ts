import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { ActivityEntry, SecurityEvent } from "../model/types";

// GET /auth/security-events — [{ id, type, title, status, payload{previous_ip,current_ip,user_agent}, created_at }].
// Optional on the backend: any failure reads as "no events", like the web.
export async function listSecurityEvents(): Promise<SecurityEvent[]> {
  try {
    return listFrom(await http("/auth/security-events"), "items", "data", "events").map((x) => {
      const d = asDict(x);
      const p = asDict(d.payload ?? d.meta);
      return {
        id: asStr(d.id),
        type: asStr(d.type ?? d.action),
        title: asStr(d.title ?? d.detail),
        status: asStr(d.status),
        fromIp: asStr(p.previous_ip),
        ip: asStr(p.current_ip ?? d.ip),
        agent: asStr(p.user_agent),
        createdAt: asStr(d.created_at),
      };
    });
  } catch {
    return [];
  }
}

// GET /users/me/activity — the user's own audit log; the backend returns it whole (no paging), so newest first here.
export async function listActivity(): Promise<ActivityEntry[]> {
  const rows = listFrom(await http("/users/me/activity"), "items", "data", "logs").map((x): ActivityEntry => {
    const d = asDict(x);
    return {
      id: asStr(d.id),
      action: asStr(d.action ?? d.type),
      detail: asStr(d.detail ?? d.description ?? d.message),
      titleUz: asStr(d.title_uz),
      descriptionUz: asStr(d.description_uz),
      ip: asStr(d.ip ?? d.ip_address),
      outcome: asStr(d.outcome),
      createdAt: asStr(d.created_at ?? d.timestamp),
    };
  });
  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
