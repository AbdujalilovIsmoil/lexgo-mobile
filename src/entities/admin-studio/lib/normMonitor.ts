import { asDict, asNum } from "@/shared/lib/json";
import type { StudioActivity, StudioMonitoring } from "../model/typesAdmin";
import { boolOf, first, lower, listOf, personOf, timeOf } from "./norm";

const sec = (a: string, b: string): number => {
  const s = Date.parse(a);
  const e = Date.parse(b);
  return Number.isFinite(s) && Number.isFinite(e) && e > s ? Math.round((e - s) / 1000) : 0;
};

export function normActivity(raw: unknown): StudioActivity {
  const r = asDict(raw);
  const meta = asDict(r.meta);
  const startedAt = timeOf(r.started_at, r.created_at);
  const lastSeenAt = timeOf(r.last_seen_at, r.updated_at);
  const endedAt = timeOf(r.ended_at);
  const online = boolOf(r.online ?? r.is_online) ?? (lower(r.status) === "online" || (!endedAt && Date.now() - Date.parse(lastSeenAt) < 90_000));
  return {
    sessionId: first(r.session_id, r.id),
    userId: first(r.user_id),
    userName: first(r.user_name, r.full_name, personOf(r.user)),
    role: first(r.role, r.user_role),
    code: first(r.constructor_code, r.code),
    objectId: first(r.object_id),
    objectName: first(r.object_name, meta.object_name),
    online,
    startedAt,
    lastSeenAt,
    endedAt,
    durationSec: asNum(r.duration_seconds ?? r.worked_seconds, sec(startedAt, endedAt || lastSeenAt)),
    saves: asNum(r.save_count ?? r.saves),
  };
}

export function normMonitoring(raw: unknown): StudioMonitoring {
  const d = asDict(raw);
  const s = asDict(d.summary);
  const items = listOf(raw, ["items", "sessions", "activity"]).map(normActivity);
  const users = listOf(d.users, ["items", "users"]).map((u) => {
    const x = asDict(u);
    return { id: first(x.id, x.user_id), name: first(x.name, x.user_name, x.full_name), sessions: asNum(x.sessions ?? x.sessions_count ?? x.session_count) };
  });
  const online = asNum(s.online ?? d.online, items.filter((a) => a.online).length);
  return {
    items,
    users: users.filter((u) => u.id),
    summary: { online, sessions: asNum(s.sessions, items.length), users: asNum(s.users, users.length), saves: asNum(s.save_count ?? s.saves), objects: asNum(s.objects_created), submitted: asNum(s.submitted_for_approval), seconds: asNum(s.duration_seconds) },
  };
}
