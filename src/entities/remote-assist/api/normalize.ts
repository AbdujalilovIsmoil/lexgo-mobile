import { asArr, asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import { RA_TERMINAL, type RaCaps, type RaCommand, type RaMeta, type RaPerson, type RaPhase, type RaSession } from "../model/types";

// Server times: a naive string is UTC; microseconds are cut so Hermes parses them.
export function msOf(v: unknown): number {
  let s = asStr(v).trim();
  if (!s) return 0;
  if (/^\d{4}-\d{2}-\d{2}[ T]\d/.test(s)) {
    s = s.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1");
    if (!/([zZ]|[+-]\d{2}:?\d{2})$/.test(s)) s += "Z";
  }
  const n = Date.parse(s);
  return Number.isFinite(n) ? n : 0;
}

// A list of keys: plain strings or {key|id} objects (the meta lists both ways).
const keys = (v: unknown): string[] => asArr(v).map((x) => (typeof x === "string" ? x : asStr(asDict(x).key ?? asDict(x).id))).filter(Boolean);

function person(v: unknown): RaPerson {
  const d = asDict(v);
  return { id: asStr(d.id ?? d.user_id), name: asStr(d.name ?? d.full_name).trim(), lexgoId: asStr(d.lexgo_id), role: asStr(d.role) };
}

function phaseOf(status: string): RaPhase {
  if (status === "pending_consent") return "pending";
  if (status === "active" || status === "paused") return status;
  if (!status || RA_TERMINAL.has(status)) return "closed";
  return "pending";
}

function caps(v: unknown): RaCaps | null {
  if (!v || typeof v !== "object") return null;
  const d = v as Dict;
  return { consent: d.can_consent === true, pause: d.can_pause === true, resume: d.can_resume === true, revoke: d.can_revoke === true, command: d.can_command === true, end: d.can_end === true };
}

/** A session (§14) from a REST body, an event's `session` or a pending-list row. */
export function normSession(v: unknown): RaSession {
  const outer = asDict(v);
  const d = asDict(outer.session).id ? asDict(outer.session) : outer;
  const status = asStr(d.status).toLowerCase();
  return {
    id: asStr(d.id ?? d.session_id),
    ticketId: asStr(d.ticket_id),
    callId: asStr(d.call_id),
    client: person(d.client),
    operator: person(d.operator),
    mode: asStr(d.mode),
    status,
    phase: phaseOf(status),
    reason: asStr(d.reason).trim(),
    requestedScopes: keys(d.requested_scopes),
    grantedScopes: keys(d.granted_scopes),
    clientUiRevision: asNum(d.client_ui_revision),
    consentVersion: asStr(d.consent_version),
    expiresAt: msOf(d.expires_at),
    endReason: asStr(d.end_reason),
    caps: caps(d.capabilities),
  };
}

/** The pending list (§8): `count` is the total waiting, not this page's length. */
export function normPending(v: unknown): { items: RaSession[]; count: number } {
  const d = asDict(v);
  const items = (Array.isArray(v) ? v : asArr(d.items)).map(normSession).filter((s) => s.id);
  return { items, count: Math.max(asNum(d.count, items.length), items.length) };
}

/** A command (§7, §12): a REST row, a `command` wrapper or an event payload. */
export function normCommand(v: unknown): RaCommand {
  const outer = asDict(v);
  const inner = asDict(outer.command);
  const d = Object.keys(inner).length ? inner : outer;
  return {
    id: asStr(d.id ?? d.command_id),
    actionId: asStr(d.action_id),
    pageId: asStr(d.page_id),
    componentId: asStr(d.component_id),
    payload: asDict(d.payload),
    expectedUiRevision: asNum(d.expected_ui_revision),
    requiresConfirmation: (d.requires_confirmation ?? d.requires_client_confirmation) === true,
    status: asStr(d.status, "pending").toLowerCase(),
    createdAt: msOf(d.created_at),
    expiresAt: msOf(d.expires_at),
  };
}

const flags = (v: unknown): Record<string, boolean> => Object.fromEntries(Object.entries(asDict(v)).map(([k, x]) => [k, x === true]));

/** GET /remote-assistance/meta (§6): the authoritative modes, actions, limits and security flags. */
export function normMeta(v: unknown): RaMeta {
  const d = asDict(v);
  const s = asDict(d.session);
  return {
    contractVersion: asStr(d.contract_version),
    consentVersion: asStr(d.consent_version) || "1.0",
    modes: asArr(d.modes).map((m) => ({ key: asStr(asDict(m).key ?? m), scopes: keys(asDict(m).scopes) })).filter((m) => m.key),
    actions: asArr(d.actions)
      .map((x) => {
        const a = asDict(x);
        return { id: asStr(a.action_id ?? a.id), scope: asStr(a.scope), modes: keys(a.modes), componentRequired: a.component_required === true, confirm: a.requires_client_confirmation === true };
      })
      .filter((a) => a.id),
    maxMinutes: asNum(s.max_minutes, 30),
    idlePauseSeconds: asNum(s.idle_pause_seconds, 90),
    commandTtlSeconds: asNum(s.command_ttl_seconds, 20),
    security: flags(d.security),
  };
}
