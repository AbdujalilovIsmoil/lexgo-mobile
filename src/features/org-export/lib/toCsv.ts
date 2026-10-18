import type { WorkItem } from "@/entities/organization";

const cell = (v: string | number) => {
  // A text cell that starts with = + - @ would run as a formula in Excel; the quote keeps it text.
  const raw = typeof v === "string" && /^[=+\-@]/.test(v) ? `'${v}` : String(v);
  const s = raw.replace(/\r?\n/g, " ");
  return /[",;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Excel-friendly CSV (UTF-8 with BOM so Cyrillic and apostrophes survive): one row per work item.
export function toCsv(head: string[], items: WorkItem[], nameOf: (id: string) => string): string {
  const rows = items.map((w) => [w.workId, w.kind, w.title, w.status, w.paymentStatus, nameOf(w.memberUserId), w.clientName, w.amount, w.deadlineAt, w.createdAt, w.updatedAt]);
  return `﻿${[head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n")}\r\n`;
}
