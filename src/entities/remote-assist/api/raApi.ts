import { http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import type { RaAck, RaClientState, RaCommand, RaMeta, RaSession } from "../model/types";
import { normCommand, normMeta, normPending, normSession } from "./normalize";

// The client side of /remote-assistance (TZ RA §6, §8, §9, §11, §13, §15). Every call carries the bearer token (shared/api).
const S = (id: string) => `/remote-assistance/sessions/${encodeURIComponent(id)}`;
const post = (path: string, body: unknown) => http(path, { method: "POST", body });

export const getRaMeta = async (): Promise<RaMeta> => normMeta(await http("/remote-assistance/meta"));

export const listRaPending = async () => normPending(await http("/remote-assistance/sessions/pending?limit=20&offset=0"));

export const getRaSession = async (id: string): Promise<RaSession> => normSession(await http(S(id)));

export type RaAnswer = { decision: "accept" | "deny"; mode: string; grantedScopes: string[]; deviceSessionId: string; consentVersion: string };

/** Accept or deny (§8): the same mode, consent version and device session id either way; a denial grants nothing. */
export const answerRa = async (id: string, a: RaAnswer): Promise<RaSession> =>
  normSession(
    await post(`${S(id)}/consent`, {
      decision: a.decision,
      mode: a.mode,
      granted_scopes: a.decision === "accept" ? a.grantedScopes.slice(0, 20) : [],
      device_session_id: a.deviceSessionId,
      consent_version: a.consentVersion,
    }),
  );

export const postRaState = (id: string, state: RaClientState) => post(`${S(id)}/client-state`, state);

// Pause / revoke / end take a short reason for the audit trail (§13); resume takes none.
export const pauseRa = async (id: string, reason: string) => normSession(await post(`${S(id)}/pause`, { reason }));
export const resumeRa = async (id: string) => normSession(await post(`${S(id)}/resume`, {}));
export const revokeRa = async (id: string, reason: string) => normSession(await post(`${S(id)}/revoke`, { reason }));
export const endRa = async (id: string, reason: string) => normSession(await post(`${S(id)}/end`, { reason }));

/** The session's command history (§15), oldest first; read after a reconnect to pick up what was missed. */
export async function listRaCommands(id: string): Promise<RaCommand[]> {
  const rows = listFrom(await http(`${S(id)}/commands?limit=50&offset=0`), "items").map(normCommand).filter((c) => c.id);
  return rows.sort((a, b) => a.createdAt - b.createdAt);
}

/** The body of one acknowledgement, the same over the socket (with `command_id`) and over HTTP. */
export const ackBody = (deviceSessionId: string, a: RaAck) => ({ device_session_id: deviceSessionId, status: a.status, failure_code: a.failureCode.slice(0, 120), result: a.result });

export const ackRa = (id: string, commandId: string, deviceSessionId: string, a: RaAck) => post(`${S(id)}/commands/${encodeURIComponent(commandId)}/ack`, ackBody(deviceSessionId, a));
