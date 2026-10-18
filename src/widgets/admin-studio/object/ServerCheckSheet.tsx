import { Pill, Text } from "@/shared/ui";
import { FactRows, FormSheet, QueryBoundary } from "@/shared/ui/admin";
import { useServerCheck, useStudioText } from "@/entities/admin-studio";
import type { Workspace } from "@/features/admin-studio";
import { humanizeSlug } from "@/shared/lib/format";
import { ErrorSummary } from "./ErrorSummary";

// What the server says about the current draft (validate + dry-run preview): errors per field, what it would change on the
// runtime object and whether approval is needed. Nothing is saved. "Show in form" copies the errors onto the fields.
export function ServerCheckSheet({ ws, visible, onClose }: { ws: Workspace; visible: boolean; onClose: () => void }) {
  const { t } = useStudioText();
  const q = useServerCheck(ws.code, ws.draft?.payload ?? {}, visible);
  const c = q.data;
  const errors = Object.fromEntries((c?.errors ?? []).map((e) => [e.field || "_", e.message]));
  return (
    <FormSheet
      visible={visible} onClose={onClose} title={t("ag9.check.title")} subtitle={t("ag9.check.lead")} snaps={[0.7, 0.94]}
      onSubmit={c && !c.ok ? () => { ws.setErrors(errors); onClose(); } : undefined} submitLabel={t("ag9.check.apply")}
    >
      <QueryBoundary query={q}>
        {c ? (
          <>
            <Pill label={c.ok ? t("ag9.check.ok") : t("ag9.check.bad", { n: c.errors.length })} tone={c.ok ? "ok" : "err"} />
            <ErrorSummary errors={errors} ctorFields={ws.ctor?.fields ?? []} />
            <FactRows rows={[
              { label: t("ag9.check.target"), value: humanizeSlug(c.target) }, { label: t("ag9.check.operation"), value: humanizeSlug(c.operation) },
              { label: t("ag9.check.approval"), value: c.requiresApproval ? t("adm.yes") : t("adm.no") }, { label: t("ag9.check.changed"), value: c.changed.map(humanizeSlug).join(", ") },
            ]} />
            {c.warnings.map((w, i) => <Text key={i} variant="small" tone="warn">⚠ {w}</Text>)}
          </>
        ) : null}
      </QueryBoundary>
    </FormSheet>
  );
}
