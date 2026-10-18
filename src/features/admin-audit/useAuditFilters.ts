import { useMemo, useState } from "react";
import { useDateRange } from "@/shared/ui/admin";
import type { AuditFilters } from "@/entities/admin-audit";

export type TextFilters = { userId: string; userName: string; action: string; targetType: string; targetId: string };
export const NO_TEXT: TextFilters = { userId: "", userName: "", action: "", targetType: "", targetId: "" };

// Filters of the audit log: the period applies at once, the text filters (user, action,
// target type / id) apply from the filter sheet. `filters` is the API shape.
export function useAuditFilters() {
  const bar = useDateRange("d7");
  const [text, setText] = useState<TextFilters>(NO_TEXT);
  const { from, to } = bar.range;
  const filters: AuditFilters = useMemo(() => ({ dateFrom: from, dateTo: to, userId: text.userId, action: text.action, targetType: text.targetType, targetId: text.targetId }), [from, to, text]);
  const active = [text.userId, text.action, text.targetType, text.targetId].filter(Boolean).length;
  return { bar, text, setText, filters, active, clear: () => setText(NO_TEXT) };
}
