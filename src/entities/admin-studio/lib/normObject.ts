import { asDict } from "@/shared/lib/json";
import type { StudioComment, StudioDetail, StudioObject } from "../model/types";
import { boolOf, first, listOf, personOf, timeOf } from "./norm";
import { normStatus, normStep, normVersion } from "./normVersion";

export function normObject(raw: unknown): StudioObject {
  const r = asDict(raw);
  const cur = asDict(r.current_version);
  const status = r.status ?? r.state;
  return {
    id: first(r.id, r.object_id),
    code: first(r.constructor_code, r.code),
    title: first(r.title, r.name),
    status: normStatus(status),
    statusRaw: String(status ?? ""),
    currentVersionId: first(r.current_version_id, cur.id),
    currentVersion: first(r.current_version_label, cur.version, r.version),
    publishedVersionId: first(r.published_version_id, asDict(r.published_version).id),
    assignedTo: personOf(r.assigned_to ?? r.assigned_user_name),
    createdBy: personOf(r.created_by ?? r.owner_name),
    updatedAt: timeOf(r.updated_at, r.created_at),
    createdAt: timeOf(r.created_at),
    hasFile: boolOf(r.has_file ?? cur.has_file) ?? false,
    raw: r,
  };
}

export function normDetail(raw: unknown): StudioDetail {
  const outer = asDict(raw);
  const base = asDict(outer.object ?? outer);
  const obj = normObject({ ...outer, ...base });
  const cur = asDict(outer.current_version ?? base.current_version);
  const versions = listOf(outer.versions ?? base.versions, ["items", "versions"]).map(normVersion).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rawSteps = listOf(outer.approval_steps ?? outer.steps ?? base.steps, ["items", "steps"]);
  // The approvals list sends only the current step.
  const steps = (rawSteps.length || !outer.current_step ? rawSteps : [outer.current_step]).map(normStep).sort((a, b) => a.order - b.order);
  const curId = obj.currentVersionId || versions[0]?.id || "";
  return { ...obj, currentVersionId: curId, hasFile: obj.hasFile || Boolean(versions.find((v) => v.id === curId)?.hasFile), payload: asDict(outer.payload ?? cur.payload ?? versions.find((v) => v.id === curId)?.payload), versions, steps };
}

export function normComment(raw: unknown): StudioComment {
  const r = asDict(raw);
  return {
    id: first(r.id, r.comment_id),
    text: first(r.comment, r.text, r.body),
    author: first(personOf(r.author ?? r.user), r.author_name, r.user_name),
    authorRole: first(r.author_role, r.role),
    versionId: first(r.version_id),
    createdAt: timeOf(r.created_at),
  };
}
