import type { CaseInput, ProCase } from "@/entities/pro-cases";
import { dayKey, toIso } from "@/shared/lib/pro/dates";

export type Draft = { title: string; type: string; status: string; stage: string; next: string; deadline: string; desc: string };

export const draftOf = (c: ProCase | null): Draft => ({
  title: c?.title ?? "",
  type: c?.type ?? "general",
  status: c?.status || "active",
  stage: c?.stage ?? "",
  next: c?.nextAction ?? "",
  deadline: c?.deadlineAt ? dayKey(c.deadlineAt) : "",
  desc: c?.description ?? "",
});

export function bodyOf(d: Draft, editing: boolean): CaseInput & { title: string } {
  return {
    title: d.title.trim(), case_type: d.type.trim() || "general", status: d.status, stage: d.stage.trim() || undefined,
    next_action: d.next.trim(), description: d.desc.trim(),
    ...(d.deadline ? { deadline_at: toIso(d.deadline, "09:00") } : editing ? { deadline_at: null } : {}),
  };
}
