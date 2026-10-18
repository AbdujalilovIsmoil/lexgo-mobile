import { useComplaint, useCcLabel } from "@/entities/admin-callcenter";
import { ResolveFields, useResolveForm } from "@/features/admin-callcenter";
import { FormSheet, QueryBoundary, StatusPill } from "@/shared/ui/admin";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { ComplaintFacts } from "./ComplaintFacts";

const SETTLED = ["resolved", "rejected", "rework_required"];

// One complaint: the client's words, the work behind it and — until a ruling is made — the ruling form.
export function ComplaintSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useT();
  const label = useCcLabel();
  const shown = useKept(id || null) ?? "";
  const q = useComplaint(shown);
  const d = q.data;
  const f = useResolveForm(shown, d?.actions ?? [], onClose);
  const settled = !!d && SETTLED.includes(d.row.status);
  return (
    <FormSheet visible={!!id} onClose={onClose} title={d?.row.title || t("admCcB.complaintTitle")} subtitle={d?.row.workId} onSubmit={d && !settled ? f.submit : undefined} submitLabel={t("admCcB.resolveSubmit")} submitting={f.pending} snaps={[0.78, 0.96]}>
      <QueryBoundary query={q}>
        {d ? (
          <>
            <StatusPill status={d.row.status} label={label("admCcB.cStatus", d.row.status)} small={false} />
            <ComplaintFacts d={d} />
            {settled ? null : <ResolveFields f={f} />}
          </>
        ) : null}
      </QueryBoundary>
    </FormSheet>
  );
}
