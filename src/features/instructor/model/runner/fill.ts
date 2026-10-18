import type { Command } from "@/entities/instructor";
import { findPrefill } from "@/shared/instructor";
import { tapHaptic } from "@/shared/lib/haptics";
import { tr } from "../../lib/tr";
import { askConfirm } from "../askConfirm";
import { sleep, type RunCtx } from "./context";
import { markRunning, reportCancelled, reportDone, reportFailed } from "./report";

// Secrets are never pre-filled, whatever the backend asks for.
const SENSITIVE = /(pass|parol|otp|code|kod|pin|cvv|cvc|card|karta|token|secret|iban|passport|pasport)/i;
const MAX_LEN = 500;

// fill_form: shows the values, and only after the user approves does it write them into the registered fields.
export async function runFill(c: Command, ctx: RunCtx): Promise<void> {
  markRunning(c);
  const rows: { id: string; label: string; value: string; set: (v: string) => void }[] = [];
  const skipped: { id: string; reason: string }[] = [];
  for (const [id, value] of Object.entries(c.fields).slice(0, 10)) {
    const f = findPrefill(id);
    if (!value.trim() || value.length > MAX_LEN) skipped.push({ id, reason: "invalid_value" });
    else if (SENSITIVE.test(id) || f?.sensitive) skipped.push({ id, reason: "sensitive" });
    else if (!f) skipped.push({ id, reason: "target_missing" });
    else rows.push({ id, label: f.label, value, set: f.set });
  }
  if (!rows.length) return void reportFailed(c, "field_not_fillable", { skipped });
  const list = rows.map((r) => `${r.label}: ${r.value}`).join("\n");
  const asked = await askConfirm(
    { title: tr("ax3.fillTitle"), message: `${tr("ax3.fillText")}\n\n${list}`, confirmLabel: tr("ax3.fillApply"), cancelLabel: tr("ax3.cancel"), icon: "edit-3" },
    async () => rows.forEach((r) => r.set(r.value)),
  );
  if (ctx.signal.aborted) return;
  if (!asked.ok) return void reportCancelled(c, "user_declined");
  tapHaptic();
  await sleep(200, ctx.signal);
  reportDone(c, { filled: rows.map((r) => r.id), skipped });
}
