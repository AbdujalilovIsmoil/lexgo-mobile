export type ResolveInput =
  | { action: "replace_options"; ids: string[] }
  | { action: "full_refund"; reason: string }
  | { action: "partial_refund"; amount: number; reason: string };

// POST …/marketplace-additional-payment/{id}/resolve (TZ 12). The amount is the so'm the operator typed; the backend validates it.
export function resolveBody(i: ResolveInput): Record<string, unknown> {
  if (i.action === "replace_options") return { action: i.action, selected_option_ids: i.ids };
  if (i.action === "full_refund") return { action: i.action, reason: i.reason.trim() };
  return { action: i.action, amount: i.amount, reason: i.reason.trim() };
}
