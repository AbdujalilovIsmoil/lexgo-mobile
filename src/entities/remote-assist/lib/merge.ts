import { asDict, asStr } from "@/shared/lib/json";
import type { RaSession } from "../model/types";

/** A newer view of the same session: what a partial event left out keeps its last value, so the banner never blanks. */
export function mergeSession(prev: RaSession | null, next: RaSession): RaSession {
  if (!prev || prev.id !== next.id) return next;
  return {
    ...next,
    ticketId: next.ticketId || prev.ticketId,
    callId: next.callId || prev.callId,
    client: next.client.id || next.client.name ? next.client : prev.client,
    operator: next.operator.id || next.operator.name ? next.operator : prev.operator,
    mode: next.mode || prev.mode,
    status: next.status || prev.status,
    phase: next.status ? next.phase : prev.phase,
    reason: next.reason || prev.reason,
    requestedScopes: next.requestedScopes.length ? next.requestedScopes : prev.requestedScopes,
    grantedScopes: next.grantedScopes.length ? next.grantedScopes : prev.grantedScopes,
    clientUiRevision: Math.max(next.clientUiRevision, prev.clientUiRevision),
    consentVersion: next.consentVersion || prev.consentVersion,
    expiresAt: next.expiresAt || prev.expiresAt,
    endReason: next.endReason || prev.endReason,
    caps: next.caps ?? prev.caps,
  };
}

/**
 * The remote-assistance event a user-socket frame or a notification is about ("remote_assist.requested" …), or "". A notification may
 * carry it as its type, kind, data.type or data.event.
 */
export function raEventOf(v: unknown): string {
  const d = asDict(v);
  const n = asDict(d.notification ?? d);
  const data = { ...asDict(n.meta ?? n.metadata), ...asDict(n.data) };
  const names = [d.event, d.type, n.event, n.type, n.kind, n.event_type, data.type, data.event].map((x) => asStr(x));
  return names.find((x) => x.startsWith("remote_assist.")) ?? "";
}

/** The session id a notification / push payload points at. */
export function raSessionIdOf(v: unknown): string {
  const d = asDict(v);
  const n = asDict(d.notification ?? d);
  const data = { ...asDict(n.meta ?? n.metadata), ...asDict(n.data), ...asDict(d.data) };
  const pick = (o: Record<string, unknown>) => asStr(o.session_id ?? o.remote_assist_session_id ?? o.remote_assistance_session_id ?? asDict(o.session).id);
  const entity = /remote/i.test(asStr(data.entity_type ?? n.entity_type)) ? asStr(data.entity_id ?? n.entity_id) : "";
  return pick(d) || pick(n) || pick(data) || entity;
}
