import type { Dict } from "@/shared/lib/json";

// Remote assistance (TZ.md "Remote Assistance Frontend Integration Contract" §6, §13, §14). The response bodies are untyped in OpenAPI,
// so every field is read defensively (api/normalize).
export type RaPhase = "pending" | "active" | "paused" | "closed";
export type RaPerson = { id: string; name: string; lexgoId: string; role: string };
// What the backend lets THIS user do with the session now (§14: buttons follow it, never status or role).
export type RaCaps = { consent: boolean; pause: boolean; resume: boolean; revoke: boolean; command: boolean; end: boolean };

export type RaSession = {
  id: string;
  ticketId: string;
  callId: string;
  client: RaPerson;
  operator: RaPerson;
  mode: string;
  status: string;
  phase: RaPhase;
  reason: string;
  requestedScopes: string[];
  grantedScopes: string[];
  clientUiRevision: number;
  consentVersion: string;
  expiresAt: number; // epoch ms, 0 = unknown
  endReason: string;
  caps: RaCaps | null; // null when the payload carried none (a partial event)
};

export type RaMetaAction = { id: string; scope: string; modes: string[]; componentRequired: boolean; confirm: boolean };

export type RaMeta = {
  contractVersion: string;
  consentVersion: string;
  modes: { key: string; scopes: string[] }[];
  actions: RaMetaAction[];
  maxMinutes: number;
  idlePauseSeconds: number;
  commandTtlSeconds: number;
  security: Record<string, boolean>;
};

export type RaCommand = {
  id: string;
  actionId: string;
  pageId: string;
  componentId: string;
  payload: Dict;
  expectedUiRevision: number;
  requiresConfirmation: boolean;
  status: string;
  createdAt: number; // epoch ms, 0 = unknown
  expiresAt: number;
};

export type RaAckStatus = "executed" | "rejected" | "confirmation_required" | "confirmed" | "cancelled";
/** One acknowledgement (§11). `result` holds safe facts only — never a value, a secret, DOM or a file. */
export type RaAck = { status: RaAckStatus; failureCode: string; result: Record<string, string | number | boolean> };

export type RaElementWire = { component_id: string; label: string; actions: string[]; sensitivity: string; state: string };
/** The client-state body (§9) — identical over the socket and over HTTP. */
export type RaClientState = { device_session_id: string; page_id: string; route: string; ui_revision: number; elements: RaElementWire[] };

export const RA_TERMINAL = new Set(["denied", "revoked", "ended", "expired", "emergency_revoked"]);
// Command statuses that need nothing more from this phone.
export const RA_SETTLED = new Set(["executed", "rejected", "confirmed", "cancelled", "expired", "failed", "confirmation_required"]);
