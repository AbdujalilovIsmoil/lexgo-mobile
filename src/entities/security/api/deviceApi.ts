import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { DeviceSession } from "../model/types";

// GET /auth/sessions — every refresh session of the account (no paging), newest activity first.
export async function listSessions(): Promise<DeviceSession[]> {
  const rows = listFrom(await http("/auth/sessions"), "items", "data", "sessions").map((x): DeviceSession => {
    const d = asDict(x);
    const cur = d.current ?? d.is_current ?? d.this_device;
    return {
      id: asStr(d.id),
      deviceLabel: asStr(d.device_label ?? d.device),
      ip: asStr(d.ip ?? d.ip_address),
      lastUsedAt: asStr(d.last_used_at ?? d.last_active),
      createdAt: asStr(d.created_at),
      expiresAt: asStr(d.expires_at),
      current: cur == null ? undefined : Boolean(cur),
    };
  });
  return rows.sort((a, b) => Date.parse(b.lastUsedAt || b.createdAt) - Date.parse(a.lastUsedAt || a.createdAt));
}

export async function revokeSession(id: string): Promise<void> {
  await http(`/auth/sessions/${encodeURIComponent(id)}`, { method: "DELETE" });
}
