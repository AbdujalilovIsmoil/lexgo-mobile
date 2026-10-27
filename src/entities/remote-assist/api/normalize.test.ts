import { grantedActions, grantedScopes } from "../lib/scopes";
import { mergeSession, raEventOf, raSessionIdOf } from "../lib/merge";
import { msOf, normCommand, normMeta, normPending, normSession } from "./normalize";

const SESSION = {
  id: "s1",
  ticket_id: "t1",
  call_id: "k1",
  client: { id: "u1", name: "Ali", lexgo_id: "100200", role: "client" },
  operator: { id: "o1", name: " Dilnoza ", lexgo_id: "900100", role: "call_center" },
  mode: "control",
  status: "PENDING_CONSENT",
  reason: "Obuna bo'yicha yordam",
  requested_scopes: ["view_page_context", "highlight", { key: "navigate" }],
  granted_scopes: [],
  client_ui_revision: "14",
  consent_version: "1.0",
  expires_at: "2026-10-27 10:00:00.123456",
  capabilities: { can_consent: true, can_pause: false, can_revoke: true, can_end: "yes" },
};

describe("remote-assistance normalizers", () => {
  it("reads a session from a body, an event's `session` wrapper, with naive times as UTC", () => {
    const s = normSession(SESSION);
    expect(s).toMatchObject({ id: "s1", ticketId: "t1", status: "pending_consent", phase: "pending", mode: "control", clientUiRevision: 14, requestedScopes: ["view_page_context", "highlight", "navigate"] });
    expect(s.operator).toEqual({ id: "o1", name: "Dilnoza", lexgoId: "900100", role: "call_center" });
    expect(s.expiresAt).toBe(Date.UTC(2026, 9, 27, 10, 0, 0, 123));
    expect(s.caps).toEqual({ consent: true, pause: false, resume: false, revoke: true, command: false, end: false });
    expect(normSession({ session: { ...SESSION, status: "active" } })).toMatchObject({ id: "s1", phase: "active" });
    expect(normSession({ ...SESSION, capabilities: undefined }).caps).toBeNull();
    expect(["denied", "revoked", "ended", "expired", "emergency_revoked", ""].map((status) => normSession({ id: "x", status }).phase)).toEqual(Array(6).fill("closed"));
    expect(normSession({ id: "x", status: "paused" }).phase).toBe("paused");
  });

  it("reads the pending page: count is the total waiting, not the page size", () => {
    expect(normPending({ items: [SESSION, { status: "active" }], count: 7, limit: 20, offset: 0 })).toMatchObject({ count: 7, items: [{ id: "s1" }] });
    expect(normPending({ items: [SESSION] })).toMatchObject({ count: 1 });
    expect(normPending(null)).toEqual({ items: [], count: 0 });
  });

  it("reads a command from a row, a `command` wrapper or an event payload", () => {
    const row = { command_id: "c1", action_id: "form.set_value", page_id: "client.profile", component_id: "profile.full_name", payload: { value: "x" }, expected_ui_revision: 14, requires_client_confirmation: true, created_at: "2026-10-27T10:00:00Z" };
    expect(normCommand(row)).toMatchObject({ id: "c1", actionId: "form.set_value", expectedUiRevision: 14, requiresConfirmation: true, status: "pending", createdAt: Date.UTC(2026, 9, 27, 10) });
    expect(normCommand({ command: { ...row, id: "c2", status: "EXECUTED" } })).toMatchObject({ id: "c2", status: "executed" });
    expect(normCommand({ id: "c3", action_id: "page.scroll_to", payload: "junk" })).toMatchObject({ id: "c3", payload: {}, expiresAt: 0 });
  });

  it("reads the runtime contract with safe defaults", () => {
    const m = normMeta({
      contract_version: "1.0",
      modes: [{ key: "guide", scopes: [] }, "control"],
      actions: [{ action_id: "element.highlight", scope: "highlight", modes: ["control", "guide"], component_required: true, requires_client_confirmation: false }, { scope: "x" }],
      session: { max_minutes: 20 },
      security: { raw_dom: false, external_navigation: "no" },
    });
    expect(m).toMatchObject({ consentVersion: "1.0", maxMinutes: 20, idlePauseSeconds: 90, commandTtlSeconds: 20, security: { raw_dom: false, external_navigation: false } });
    expect(m.modes.map((x) => x.key)).toEqual(["guide", "control"]);
    expect(m.actions).toEqual([{ id: "element.highlight", scope: "highlight", modes: ["control", "guide"], componentRequired: true, confirm: false }]);
  });

  it("grants an action only for the session's mode and the scopes the client left on", () => {
    const m = normMeta({ actions: [{ action_id: "element.highlight", scope: "highlight", modes: ["guide", "control"] }, { action_id: "form.set_value", scope: "form_fill", modes: ["control"] }, { action_id: "step.next", modes: ["control"] }] });
    expect([...grantedActions(m, "guide", ["highlight", "form_fill"])]).toEqual(["element.highlight"]);
    expect([...grantedActions(m, "control", ["highlight"])]).toEqual(["element.highlight", "step.next"]);
    expect(grantedScopes(["view_page_context", "highlight", "personal_form_fill", "highlight"], new Set(["personal_form_fill", "view_page_context"]))).toEqual(["view_page_context", "highlight"]);
  });

  it("merges a partial event into the session it knows, never blanking it", () => {
    const prev = normSession({ ...SESSION, status: "active" });
    const next = mergeSession(prev, normSession({ id: "s1", status: "paused", client_ui_revision: 3 }));
    expect(next).toMatchObject({ phase: "paused", mode: "control", operator: { name: "Dilnoza" }, clientUiRevision: 14, caps: prev.caps });
    expect(mergeSession(prev, normSession({ id: "other", status: "active" })).id).toBe("other");
  });

  it("finds remote-assistance events and their session in socket frames, notifications and push data", () => {
    expect(raEventOf({ event: "remote_assist.requested", session: { id: "s1" } })).toBe("remote_assist.requested");
    expect(raEventOf({ event: "notification.created", notification: { kind: "in_app", data: { type: "remote_assist.requested", session_id: "s2" } } })).toBe("remote_assist.requested");
    expect(raEventOf({ event: "notification.created", notification: { type: "order.created" } })).toBe("");
    expect(raSessionIdOf({ event: "remote_assist.requested", session: { id: "s1" } })).toBe("s1");
    expect(raSessionIdOf({ event: "notification.created", notification: { data: { session_id: "s2" } } })).toBe("s2");
    expect(raSessionIdOf({ type: "remote_assist.requested", entity_type: "remote_assistance_session", entity_id: "s3" })).toBe("s3");
    expect(msOf("garbage")).toBe(0);
  });
});
