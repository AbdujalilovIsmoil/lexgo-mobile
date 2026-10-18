import { useMemo, useState } from "react";
import { isApprovalFree, useConstructor, useFormContext, useObject, useStudioAccess, type StudioDetail, type StudioVersion } from "@/entities/admin-studio";
import { editorFor } from "../editors";
import type { Errors } from "../form/types";
import { pruneErrors } from "./errors";
import { useDraft } from "./useDraft";
import { useHeartbeat } from "./useHeartbeat";
import { useLeaveGuard } from "./useLeaveGuard";
import { useObjectOps } from "./useObjectOps";

const LOCKED = ["submitted", "in_review", "archived"];
export const currentVersionOf = (d: StudioDetail | null): StudioVersion | null => d?.versions.find((v) => v.id === d.currentVersionId) ?? d?.versions[0] ?? null;

// Everything the object editor screen needs: the object, its editable draft, access flags,
// validation errors, the write operations and the leave guard / heartbeat.
export type RecordRef = { record: string; source: string };

export function useWorkspace(id: string, newCode: string, rec?: RecordRef) {
  const access = useStudioAccess();
  const q = useObject(id);
  const detail = q.data ?? null;
  const code = detail?.code || newCode;
  const ctorQ = useConstructor(code);
  const ctor = ctorQ.data ?? access.constructors.find((c) => c.code === code) ?? null;
  const fc = useFormContext(id ? "" : newCode, "edit", rec?.record ?? "", rec?.source ?? "");
  const seed = useMemo(() => (fc.data ? { title: fc.data.title, payload: fc.data.payload } : null), [fc.data]);
  const target = fc.data?.targetId ? { id: fc.data.targetId, type: fc.data.targetType } : undefined;
  const d = useDraft(detail, id ? "" : newCode, rec?.record ? seed : undefined);
  const [errors, setErrorsState] = useState<Errors>({});
  const status = detail?.status ?? "draft";
  const curVer = currentVersionOf(detail);
  const hasFile = Boolean(detail?.hasFile || curVer?.hasFile);
  const uploadMode = code === "K06" && d.draft?.payload.mode === "upload";
  const approvalFree = isApprovalFree(code, ctor);
  const readOnly = !access.canEdit || LOCKED.includes(status);
  const guard = useLeaveGuard(d.dirty && !readOnly);
  const hb = useHeartbeat({ enabled: !!code && status !== "archived", code, objectId: id, versionId: detail?.currentVersionId ?? "", name: d.draft?.title ?? "" });
  const ops = useObjectOps({ id, code, draft: d.draft, dirty: d.dirty, ctor, approvalFree, needFile: uploadMode, target, hasFile, apply: d.apply, markSaved: hb.markSaved, release: guard.release, setErrors: setErrorsState });
  return {
    ...d,
    ...ops,
    id,
    code,
    ctor,
    detail,
    access,
    status,
    curVer,
    hasFile,
    uploadMode,
    approvalFree,
    readOnly,
    creating: !id,
    errors,
    loading: q.isLoading && !!id,
    loadError: (q.isError && !detail ? q.error : null) ?? fc.error,
    reload: () => void (fc.isError ? fc.refetch() : q.refetch()),
    setErrors: setErrorsState,
    editor: editorFor(code),
    setPayload: (p: Record<string, unknown>) => (setErrorsState((e) => pruneErrors(e, d.draft?.payload ?? {}, p)), d.setPayload(p)),
  };
}
export type Workspace = ReturnType<typeof useWorkspace>;
