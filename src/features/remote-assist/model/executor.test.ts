import { normMeta, normSession } from "@/entities/remote-assist/api/normalize";
import type { RaCommand, RaSession } from "@/entities/remote-assist/model/types";
import type { RaControl, RaControlSpec } from "@/shared/remote-assist/types";
import type { ExecCtx, RaAsk } from "./execTypes";
import { execute } from "./executor";

const ALL = ["guide", "control", "prepare"];
const meta = normMeta({
  consent_version: "1.0",
  actions: [
    { action_id: "route.navigate", scope: "navigate", modes: ALL },
    { action_id: "element.highlight", scope: "highlight", modes: ALL, component_required: true },
    { action_id: "element.tooltip", scope: "tooltip", modes: ALL, component_required: true },
    { action_id: "form.set_value", scope: "form_fill", modes: ["control", "prepare"], component_required: true },
    { action_id: "form.toggle", scope: "form_toggle", modes: ["control", "prepare"], component_required: true },
    { action_id: "modal.open", scope: "open_modal", modes: ["control", "prepare"], component_required: true },
    { action_id: "draft.prepare", scope: "prepare_draft", modes: ["prepare"], requires_client_confirmation: true },
    { action_id: "confirmation.present", scope: "present_confirmation", modes: ["prepare"], requires_client_confirmation: true },
    { action_id: "editor.open", scope: "highlight", modes: ALL, component_required: true },
  ],
});
const SCOPES = ["view_page_context", "navigate", "highlight", "tooltip", "form_fill", "form_toggle", "open_modal", "prepare_draft", "present_confirmation"];
const session = (over: Partial<RaSession> = {}): RaSession => ({ ...normSession({ id: "s1", status: "active", mode: "prepare", granted_scopes: SCOPES }), ...over });
const cmd = (over: Partial<RaCommand> = {}): RaCommand => ({
  id: "c1", actionId: "form.set_value", pageId: "client.profile", componentId: "profile.full_name", payload: { value: "Ali Valiyev" },
  expectedUiRevision: 7, requiresConfirmation: false, status: "pending", createdAt: 0, expiresAt: 0, ...over,
});
const control = (spec: Partial<RaControlSpec> & { id: string }): RaControl => ({
  label: spec.id, actions: ["element.highlight", "element.tooltip", "form.set_value", "draft.prepare", "form.toggle", "modal.open", "confirmation.present", "editor.open"],
  sensitivity: "normal", state: "ready", measure: async () => ({ x: 0, y: 0, width: 10, height: 10 }), ...spec,
} as RaControl);

function ctx(controls: RaControl[], over: Partial<ExecCtx> = {}) {
  const asks: RaAsk[] = [];
  const marks: string[] = [];
  const x: ExecCtx = {
    meta,
    session: session(),
    deviceOk: true,
    answered: () => false,
    now: 1_000_000,
    page: { id: "client.profile", revision: 5 },
    control: (id) => controls.find((c) => c.id === id) ?? null,
    ask: async (a) => (asks.push(a), true),
    navigate: jest.fn(async () => ({ ok: true as const })),
    mark: async (c) => void marks.push(c.id),
    reveal: async () => true,
    sheetOpen: () => false,
    ...over,
  };
  return { x, asks, marks };
}

const name = () => control({ id: "profile.full_name", sensitivity: "personal", setValue: jest.fn(async () => ({ ok: true as const, result: { valid: true } })) });

describe("remote-assistance executor", () => {
  it("1. needs an active session consented on this device session — before anything else is looked at", async () => {
    const { x } = ctx([], { session: session({ phase: "paused", status: "paused" }), meta: null });
    expect(await execute(cmd({ actionId: "no.such" }), x)).toMatchObject({ status: "rejected", failureCode: "session_not_active" });
    expect(await execute(cmd(), ctx([], { deviceOk: false }).x)).toMatchObject({ failureCode: "device_session_mismatch" });
  });

  it("2. never runs or answers a command twice, refuses an expired one and anything the mode / scopes do not grant", async () => {
    const field = name();
    expect(await execute(cmd(), ctx([field], { answered: (id) => id === "c1" }).x)).toBeNull();
    expect(field.setValue).not.toHaveBeenCalled();
    expect(await execute(cmd({ expiresAt: 999_000 }), ctx([field]).x)).toMatchObject({ failureCode: "command_expired" });
    expect(await execute(cmd({ actionId: "page.unknown" }), ctx([field]).x)).toMatchObject({ failureCode: "unknown_action" });
    // guide mode cannot fill a field; control mode without form_fill cannot either
    expect(await execute(cmd(), ctx([field], { session: session({ mode: "guide" }) }).x)).toMatchObject({ failureCode: "action_not_granted" });
    expect(await execute(cmd(), ctx([field], { session: session({ grantedScopes: ["view_page_context", "highlight"] }) }).x)).toMatchObject({ failureCode: "action_not_granted" });
    expect(await execute(cmd(), ctx([field], { meta: null }).x)).toMatchObject({ failureCode: "meta_unavailable" });
  });

  it("route.navigate opens only an allowlisted screen, mapped from the web route", async () => {
    const { x } = ctx([]);
    expect(await execute(cmd({ actionId: "route.navigate", componentId: "", payload: { route: "/portal/client/subscription" } }), x)).toMatchObject({ status: "executed", result: { applied: true, page_id: "client.subscription" } });
    expect(x.navigate).toHaveBeenCalledWith(expect.objectContaining({ route: "/subscription", tab: false }));
    for (const route of ["/payments", "/auth/login", "https://evil.example", "/call/r1", "/pro/orders", "/m/lawyers"]) {
      expect(await execute(cmd({ actionId: "route.navigate", componentId: "", payload: { route } }), x)).toMatchObject({ failureCode: "route_not_allowed" });
    }
    expect(x.navigate).toHaveBeenCalledTimes(1);
    const blocked = ctx([], { navigate: async () => ({ ok: false as const, code: "route_blocked_during_call" }) }).x;
    expect(await execute(cmd({ actionId: "route.navigate", componentId: "", payload: { route: "/lawyers" } }), blocked)).toMatchObject({ failureCode: "route_blocked_during_call" });
  });

  it("3. checks the page and the UI revision the operator acted on", async () => {
    const field = name();
    expect(await execute(cmd({ pageId: "client.support" }), ctx([field]).x)).toMatchObject({ failureCode: "page_changed" });
    expect(await execute(cmd({ expectedUiRevision: 4 }), ctx([field]).x)).toMatchObject({ failureCode: "ui_revision_conflict" });
    expect(await execute(cmd({ expectedUiRevision: 5 }), ctx([field], { session: session({ grantedScopes: [...SCOPES, "personal_form_fill"] }) }).x)).toMatchObject({ status: "executed" });
    expect(await execute(cmd({ pageId: "client.outside" }), ctx([field], { page: { id: "client.outside", revision: 1 } }).x)).toMatchObject({ failureCode: "page_not_registered" });
  });

  it("4–6. resolves only registered controls that still allow the action, never secret ones, personal ones only with consent", async () => {
    const field = name();
    expect(await execute(cmd({ componentId: "" }), ctx([field]).x)).toMatchObject({ failureCode: "component_required" });
    expect(await execute(cmd({ componentId: "profile.gone" }), ctx([field]).x)).toMatchObject({ failureCode: "component_not_mounted" });
    expect(await execute(cmd(), ctx([control({ id: "profile.full_name", actions: ["element.highlight"] })]).x)).toMatchObject({ failureCode: "action_not_permitted" });
    expect(await execute(cmd(), ctx([control({ id: "profile.full_name", state: "disabled" })]).x)).toMatchObject({ failureCode: "component_disabled" });
    expect(await execute(cmd({ actionId: "element.highlight" }), ctx([control({ id: "profile.full_name", state: "disabled" })]).x)).toMatchObject({ status: "executed" });
    expect(await execute(cmd(), ctx([control({ id: "profile.full_name", sensitivity: "secret" })]).x)).toMatchObject({ failureCode: "secret_component_blocked" });
    expect(await execute(cmd(), ctx([field]).x)).toMatchObject({ failureCode: "personal_scope_required" });
    expect(field.setValue).not.toHaveBeenCalled();
  });

  it("7–8. fills through the screen's adapter and reports its validation", async () => {
    const field = name();
    const personal = { session: session({ grantedScopes: [...SCOPES, "personal_form_fill"] }) };
    expect(await execute(cmd(), ctx([field], personal).x)).toEqual({ status: "executed", failureCode: "", result: { applied: true, valid: true } });
    expect(field.setValue).toHaveBeenCalledWith("Ali Valiyev");
    const refusing = control({ id: "profile.full_name", setValue: async () => ({ ok: false as const, code: "validation_failed" }) });
    expect(await execute(cmd(), ctx([refusing], personal).x)).toMatchObject({ status: "rejected", failureCode: "validation_failed", result: { applied: false } });
    expect(await execute(cmd({ payload: { value: { nested: true } } }), ctx([field], personal).x)).toMatchObject({ failureCode: "invalid_value" });
    expect(await execute(cmd({ actionId: "editor.open" }), ctx([field]).x)).toMatchObject({ failureCode: "editor_not_registered" });
    expect(await execute(cmd({ actionId: "element.tooltip", payload: {} }), ctx([field]).x)).toMatchObject({ failureCode: "tooltip_text_required" });
  });

  it("draft.prepare writes nothing until the client confirms; a no is cancelled", async () => {
    const setValue = jest.fn(async () => ({ ok: true as const }));
    const topic = control({ id: "support.message", setValue });
    const declined = ctx([topic], { ask: async () => false }).x;
    const draft = cmd({ actionId: "draft.prepare", pageId: "client.profile", componentId: "", payload: { values: { "support.message": "Obuna haqida savol" } } });
    expect(await execute(draft, declined)).toEqual({ status: "cancelled", failureCode: "client_declined", result: { applied: false } });
    expect(setValue).not.toHaveBeenCalled();
    const { x, asks } = ctx([topic]);
    expect(await execute(draft, x)).toMatchObject({ status: "confirmed", result: { applied: true, fields: 1 } });
    expect(asks[0]).toMatchObject({ kind: "draft", rows: [{ label: "support.message", value: "Obuna haqida savol" }] });
    expect(setValue).toHaveBeenCalledWith("Obuna haqida savol");
  });

  it("confirmation.present only shows the final step: it never presses anything", async () => {
    const toggle = jest.fn();
    const open = jest.fn();
    const pay = control({ id: "subscription.plan.pro.choose", toggle, open });
    const { x, asks, marks } = ctx([pay]);
    expect(await execute(cmd({ actionId: "confirmation.present", componentId: "subscription.plan.pro.choose", payload: { text: "Pro" } }), x)).toMatchObject({ status: "confirmed", result: { presented: true } });
    expect(asks[0]).toMatchObject({ kind: "present", summary: "Pro" });
    expect(marks).toEqual(["subscription.plan.pro.choose"]);
    expect(toggle).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it("modal.open opens only a registered sheet, never a second one over another", async () => {
    const open = jest.fn(async () => ({ ok: true as const }));
    const sheet = control({ id: "support.new_chat", open });
    expect(await execute(cmd({ actionId: "modal.open", componentId: "support.new_chat" }), ctx([sheet], { sheetOpen: () => true }).x)).toMatchObject({ failureCode: "sheet_open" });
    expect(await execute(cmd({ actionId: "modal.open", componentId: "support.new_chat" }), ctx([{ ...sheet, state: "selected" }]).x)).toMatchObject({ status: "executed", result: { already_open: true } });
    expect(open).not.toHaveBeenCalled();
    expect(await execute(cmd({ actionId: "modal.open", componentId: "support.new_chat" }), ctx([sheet]).x)).toMatchObject({ status: "executed" });
    expect(await execute(cmd({ actionId: "modal.open", componentId: "profile.full_name" }), ctx([name()]).x)).toMatchObject({ failureCode: "modal_not_registered" });
  });

  it("an action the meta marks for confirmation waits for the client's tap", async () => {
    const strict = normMeta({ actions: [{ action_id: "modal.open", scope: "open_modal", modes: ALL, requires_client_confirmation: true }] });
    const open = jest.fn(async () => ({ ok: true as const }));
    const { x, asks } = ctx([control({ id: "support.new_chat", open })], { meta: strict, session: session({ mode: "control" }) });
    expect(await execute(cmd({ actionId: "modal.open", componentId: "support.new_chat" }), x)).toMatchObject({ status: "confirmed" });
    expect(asks).toHaveLength(1);
    expect(open).toHaveBeenCalledTimes(1);
  });
});
