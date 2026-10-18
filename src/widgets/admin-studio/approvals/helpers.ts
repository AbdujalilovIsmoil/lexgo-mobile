import { isApprovalFree, type StudioAccess, type StudioConstructor, type StudioDetail, type StudioStatus, type StudioStep, type StudioVersion } from "@/entities/admin-studio";
import { asDict, asStr } from "@/shared/lib/json";

export const QUEUE_STATUSES: StudioStatus[] = ["submitted", "in_review", "approved", "changes_requested"];
const DONE = ["approved", "approve", "done", "completed", "passed", "skipped"];
const BACK = ["changes_requested", "rejected", "reject", "declined", "returned"];
const ALIAS: Record<string, string> = { reviewer: "studio_reviewer", publisher: "studio_publisher", editor: "studio_editor" };

export const normRole = (r: string): string => ALIAS[r.trim().toLowerCase()] ?? r.trim().toLowerCase();
export const stepDone = (s: StudioStep): boolean => DONE.includes(s.status);
export const stepBack = (s: StudioStep): boolean => BACK.includes(s.status);
export const versionOf = (d: StudioDetail): StudioVersion | null => d.versions.find((v) => v.id === d.currentVersionId) ?? d.versions[0] ?? null;
export const versionLabel = (d: StudioDetail): string => d.currentVersion || versionOf(d)?.version || "";

export function submittedOf(d: StudioDetail): { by: string; at: string } {
  const by = asDict(d.raw.submitted_by);
  return {
    by: asStr(d.raw.submitted_by_name) || asStr(by.full_name) || asStr(by.name) || versionOf(d)?.createdBy || d.createdBy,
    at: asStr(d.raw.submitted_at) || versionOf(d)?.createdAt || d.updatedAt || d.createdAt,
  };
}
export const waitingSince = (d: StudioDetail): number => Date.parse(submittedOf(d).at) || Number.MAX_SAFE_INTEGER;

export type StepAt = { index: number; total: number; step: StudioStep; back: boolean };
export function currentStepOf(d: StudioDetail): StepAt | null {
  const backAt = d.steps.findIndex(stepBack);
  if (d.status === "changes_requested" && backAt >= 0) return { index: backAt, total: d.steps.length, step: d.steps[backAt], back: true };
  const at = d.steps.findIndex((s) => !stepDone(s));
  return at < 0 ? null : { index: at, total: d.steps.length, step: d.steps[at], back: false };
}

export const isReviewable = (d: StudioDetail): boolean => d.status === "submitted" || d.status === "in_review";
export function canActOnStep(d: StudioDetail, a: StudioAccess): boolean {
  if (!a.canReview || !isReviewable(d)) return false;
  const at = currentStepOf(d);
  // The server knows best (`can_decide` on the item or on its current step); else the web's role rule.
  const flag = typeof d.raw.can_decide === "boolean" ? d.raw.can_decide : at?.step.canDecide ?? null;
  if (flag !== null) return flag;
  return a.isAdmin || !at || !at.step.role || a.roles.includes(normRole(at.step.role));
}
export const canPublishItem = (d: StudioDetail, a: StudioAccess, ctor: StudioConstructor | null): boolean => d.status === "approved" && a.canPublish && !isApprovalFree(d.code, ctor);
export const isMine = (d: StudioDetail, a: StudioAccess, ctor: StudioConstructor | null): boolean => canActOnStep(d, a) || canPublishItem(d, a, ctor);
