import { archiveObject, publishObject, rollbackObject, submitObject, uploadFile } from "@/entities/admin-studio";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { validatePayload } from "../editors";
import type { PickedFile } from "../form/types";
import type { OpsCtx, SaveMeta } from "./opsTypes";
import { useOpsCore } from "./useOpsCore";

// Save, submit, archive, publish, rollback and file upload of one object. Each resolves true on success.
export function useObjectOps(c: OpsCtx) {
  const { t } = useT();
  const { busy, error, setError, run, persist, done, refresh, open, errText } = useOpsCore(c);
  return {
    busy,
    error,
    setError,
    save: (meta?: SaveMeta) =>
      run("save", async () => {
        const id = await persist(meta);
        if (!id) return false;
        await done(id, t(c.id ? "admStudioB.toast.saved" : "admStudioB.toast.created"));
      }),
    submit: () =>
      run("submit", async () => {
        const v = validatePayload(c.code, c.draft?.payload ?? {}, c.ctor, c.draft?.title ?? "");
        if (c.needFile && !c.hasFile) v.file = "@file";
        if (Object.keys(v).length) {
          c.setErrors(v);
          return false;
        }
        const id = c.id && !c.dirty ? c.id : await persist();
        if (!id) return false;
        try {
          await submitObject(id);
        } catch (e) {
          // The draft is saved by now: open it (new object) or reload it, then show what the server said.
          if (c.id) {
            c.apply(await refresh(id));
          } else {
            open(id);
            toast(errText(e), "err");
          }
          throw e;
        }
        await done(id, t(c.approvalFree ? "admStudioB.toast.submittedFree" : "admStudioB.toast.submitted"));
      }),
    archive: () => run("archive", async () => (await archiveObject(c.id), done(c.id, t("admStudioB.toast.archived")))),
    publish: (note: string) => run("publish", async () => (await publishObject(c.id, note), done(c.id, t("admStudioB.toast.published")))),
    rollback: (versionId: string, label: string, note: string) =>
      run("rollback", async () => (await rollbackObject(c.id, versionId, note), done(c.id, t("admStudioB.toast.rolledBack", { v: label || "—" })))),
    upload: (f: PickedFile) =>
      run("upload", async () => {
        await uploadFile(c.id, f.uri, f.name);
        c.apply(await refresh(c.id));
        toast(t("admStudioB.toast.uploaded"), "ok");
      }),
  };
}
