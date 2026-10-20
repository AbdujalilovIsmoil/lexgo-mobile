import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { StudioStatus, StudioStep, StudioVersion } from "../model/types";
import { boolOf, first, lower, personOf, timeOf } from "./norm";

const SYN: Record<string, StudioStatus> = {
  new: "draft", pending: "submitted", sent: "submitted", waiting: "submitted", review: "in_review", reviewing: "in_review", under_review: "in_review", in_progress: "in_review",
  needs_changes: "changes_requested", returned: "changes_requested", rework: "changes_requested", rejected: "changes_requested", declined: "changes_requested",
  active: "published", live: "published", inactive: "archived",
};
const KNOWN = ["draft", "submitted", "in_review", "changes_requested", "approved", "published", "archived"];

export function normStatus(v: unknown): StudioStatus {
  const s = lower(v).replace(/[\s-]+/g, "_");
  return (KNOWN.includes(s) ? s : SYN[s] ?? "draft") as StudioStatus;
}

export function normVersion(raw: unknown): StudioVersion {
  const r = asDict(raw);
  const fileName = first(r.file_name, r.filename, asDict(r.file).name);
  return {
    id: first(r.id, r.version_id),
    version: first(r.version, r.version_label, r.label),
    status: normStatus(r.status),
    statusRaw: asStr(r.status),
    payload: asDict(r.payload ?? r.data),
    summary: first(r.summary, r.note, r.change_summary),
    fileName,
    hasFile: boolOf(r.has_file) ?? Boolean(first(r.file_url) || fileName),
    createdAt: timeOf(r.created_at, r.updated_at),
    createdBy: personOf(r.created_by ?? r.author ?? r.created_by_name),
  };
}

export function normStep(raw: unknown, i = 0): StudioStep {
  const r = asDict(raw);
  return {
    id: first(r.id, r.step_id, `step-${i + 1}`),
    order: asNum(r.order ?? r.step_order ?? r.step_index, i + 1),
    role: first(r.role, r.required_role, r.reviewer_role),
    title: first(r.title, r.name, r.label),
    status: lower(r.status ?? r.decision) || "pending",
    decidedBy: personOf(r.decided_by ?? r.reviewed_by ?? r.reviewer ?? r.decided_by_name),
    decidedAt: timeOf(r.decided_at, r.reviewed_at, r.completed_at),
    comment: first(r.comment, r.note),
    canDecide: boolOf(r.can_decide),
    approvers: asArr(r.approvers).map((x) => ({ id: first(asDict(x).id, asDict(x).user_id), name: first(asDict(x).full_name, asDict(x).name, asDict(x).label) })).filter((x) => x.id),
    deadlineAt: timeOf(r.deadline_at),
    overdue: r.is_overdue === true,
  };
}

