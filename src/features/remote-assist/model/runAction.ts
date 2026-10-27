import { PERSONAL_SCOPE } from "@/entities/remote-assist/lib/scopes";
import type { RaAck, RaCommand } from "@/entities/remote-assist/model/types";
import { asDict, asStr, type Dict } from "@/shared/lib/json";
import type { RaControl, RaDone } from "@/shared/remote-assist/types";
import { declined, done, reject, settle, type ExecCtx } from "./execTypes";

const MAX_VALUE = 2000;
const HIGHLIGHT_MS = 3000;
const NOTE_MS = 6000;
const TOUCH_MS = 1800;
const PRESENT_MS = 15_000;

// The operator's note (element.tooltip / highlight caption): plain text, at most 300 characters.
const noteOf = (p: Dict): string => asStr(p.text ?? p.message ?? p.tooltip ?? p.note).trim().slice(0, 300);
const valueOf = (v: unknown): string | null => {
  const s = typeof v === "string" ? v : typeof v === "number" && Number.isFinite(v) ? String(v) : null;
  return s !== null && s.length <= MAX_VALUE ? s : null;
};

/** One semantic action on one registered control, through the screen's own adapter (TZ RA §10). Never a tap on a view. */
export async function runAction(cmd: RaCommand, c: RaControl, x: ExecCtx, confirm: boolean): Promise<RaAck> {
  const p = cmd.payload;
  const id = cmd.actionId;
  const ok = async () => !confirm || x.ask({ kind: "action", label: c.label, actionId: id, rows: [], summary: "" });
  switch (id) {
    case "element.highlight": {
      if (!(await ok())) return declined();
      await x.mark(c, noteOf(p), HIGHLIGHT_MS);
      return done(confirm);
    }
    case "element.tooltip": {
      const note = noteOf(p);
      if (!note) return reject("tooltip_text_required");
      if (!(await ok())) return declined();
      await x.mark(c, note, NOTE_MS);
      return done(confirm);
    }
    case "page.scroll_to": {
      if (!(await ok())) return declined();
      if (!(await x.reveal(c))) return reject("not_scrollable");
      await x.mark(c, "", TOUCH_MS);
      return done(confirm);
    }
    case "element.focus": {
      if (!c.focus) return reject("not_focusable");
      if (!(await ok())) return declined();
      await x.mark(c, "", TOUCH_MS);
      c.focus();
      return done(confirm);
    }
    case "form.set_value":
    case "form.select_option": {
      const v = valueOf(p.value);
      if (v === null) return reject("invalid_value");
      const apply = id === "form.set_value" ? c.setValue : c.select;
      if (!apply) return reject(id === "form.set_value" ? "not_fillable" : "not_selectable");
      if (confirm && !(await x.ask({ kind: "draft", label: c.label, actionId: id, rows: [{ label: c.label, value: v }], summary: "" }))) return declined();
      const d = await apply(v);
      if (d.ok) await x.mark(c, "", TOUCH_MS);
      return settle(d, confirm);
    }
    case "form.toggle": {
      if (!c.toggle) return reject("not_toggleable");
      if (!(await ok())) return declined();
      const d = await c.toggle(typeof p.value === "boolean" ? p.value : undefined);
      if (d.ok) await x.mark(c, "", TOUCH_MS);
      return settle(d, confirm);
    }
    case "modal.open":
      if (!c.open) return reject("modal_not_registered");
      if (c.state === "selected") return done(confirm, { already_open: true });
      if (x.sheetOpen()) return reject("sheet_open");
      if (!(await ok())) return declined();
      return settle(await c.open(), confirm);
    case "step.next":
    case "step.back": {
      const step = id === "step.next" ? c.next : c.back;
      if (!step) return reject("step_not_registered");
      if (!(await ok())) return declined();
      return settle(await step(), confirm);
    }
    case "editor.open":
    case "editor.highlight":
      if (!c.editor) return reject("editor_not_registered");
      if (!(await ok())) return declined();
      return settle(await c.editor(asStr(p.section ?? p.section_id)), confirm);
    case "draft.prepare":
      return runDraft(cmd, x, c);
    case "confirmation.present": {
      // Shown, never pressed: the final tap (payment, agreement, signature, submit) stays the client's own (§3).
      if (!(await x.ask({ kind: "present", label: c.label, actionId: id, rows: [], summary: noteOf(p) }))) return declined();
      await x.mark(c, "", PRESENT_MS);
      return done(true, { presented: true });
    }
    default:
      return reject("unsupported_action");
  }
}

type Row = { c: RaControl; value: string; apply: (v: string) => RaDone | Promise<RaDone> };

/**
 * draft.prepare (§4 prepare, §10): the prepared values are shown to the client first and written only after their own tap. Either
 * `payload.values` ({component_id: value}) or `payload.value` for the command's control; every field passes the same rules as a single fill.
 */
export async function runDraft(cmd: RaCommand, x: ExecCtx, primary?: RaControl): Promise<RaAck> {
  const values = asDict(cmd.payload.values);
  const pairs: [string, unknown][] = primary ? [[primary.id, cmd.payload.value]] : Object.entries(values).slice(0, 20);
  const personal = !!x.session?.grantedScopes.includes(PERSONAL_SCOPE);
  const rows: Row[] = [];
  for (const [id, raw] of pairs) {
    const c = x.control(id);
    const value = valueOf(raw);
    if (!c || c.state === "hidden" || value === null) return reject("invalid_draft");
    if (c.sensitivity === "secret") return reject("secret_component_blocked");
    if (c.state === "disabled") return reject("component_disabled");
    const apply = c.actions.includes("form.set_value") ? c.setValue : c.actions.includes("form.select_option") ? c.select : undefined;
    if (!apply) return reject("action_not_permitted");
    if (c.sensitivity === "personal" && !personal) return reject("personal_scope_required");
    rows.push({ c, value, apply });
  }
  if (!rows.length) return reject("invalid_draft");
  const asked = { kind: "draft" as const, label: primary?.label ?? rows[0].c.label, actionId: "draft.prepare", rows: rows.map((r) => ({ label: r.c.label, value: r.value })), summary: "" };
  if (!(await x.ask(asked))) return declined();
  for (const [i, r] of rows.entries()) {
    const d = await r.apply(r.value);
    if (!d.ok) return { ...reject(d.code), result: { applied: i > 0, fields: i } };
  }
  await x.mark(rows[0].c, "", TOUCH_MS);
  return done(true, { fields: rows.length });
}
