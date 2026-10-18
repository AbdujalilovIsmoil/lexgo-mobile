import type { ActionBody, ActionPreview } from "@/entities/instructor";
import type { DialogSpec } from "@/shared/ui/dialog";
import { tr } from "../../lib/tr";
import { SUPPORT_ACTION } from "./payload";

// What the native confirm dialog tells the user BEFORE anything is executed: the server's own summary,
// detail rows, the amount, whose behalf, and (for a ticket) that the short assistant chat is shared.
export function dialogSpec(p: ActionPreview, body: ActionBody): Omit<DialogSpec, "onConfirm"> {
  const lines = [p.summary, ...p.rows.map((r) => (r.label ? `${r.label}: ${r.value}` : r.value))];
  if (p.amount) lines.push(`${tr("ax3.amount")}: ${p.amountText || `${p.amount} ${p.currency}`}`);
  if (p.actor) lines.push(`${tr("ax3.onBehalf")}: ${p.actor}`);
  if (body.action === SUPPORT_ACTION) lines.push(tr("ax3.shareHistory"));
  lines.push(...p.warnings);
  const danger = /delete|remove|cancel/.test(body.action);
  return {
    title: p.title || tr("ax3.confirmTitle"),
    message: lines.filter(Boolean).join("\n"),
    confirmLabel: p.amount ? tr("ax3.confirmPay") : tr("ax3.confirm"),
    cancelLabel: tr("ax3.cancel"),
    icon: danger ? "trash-2" : p.amount ? "credit-card" : "check-circle",
    danger,
  };
}
