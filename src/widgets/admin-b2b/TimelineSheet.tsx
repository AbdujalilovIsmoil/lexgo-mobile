import { useTimeline } from "@/entities/admin-b2b";
import { FormSheet, QueryBoundary, RowCard } from "@/shared/ui/admin";
import { EmptyState } from "@/shared/ui";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

type Target = { id: string; name: string };

// History of one corporate client (GET /b2b/clients/{id}/timeline): created, stage changes, generated documents.
export function TimelineSheet({ target, onClose }: { target: Target | null; onClose: () => void }) {
  const { t, locale } = useT();
  const k = useKept(target);
  const q = useTimeline(target?.id ?? "");
  return (
    <FormSheet visible={!!target} onClose={onClose} title={k?.name ?? ""} subtitle={t("admB2bB.timeline")}>
      <QueryBoundary query={q}>
        {q.data?.length ? q.data.map((e) => (
          <RowCard key={e.id} icon={e.type === "stage_change" ? "git-commit" : "flag"} title={e.title} subtitle={e.from && e.to ? `${humanizeSlug(e.from)} → ${humanizeSlug(e.to)}` : humanizeSlug(e.type)} meta={fmtDateTime(e.createdAt, locale)} />
        )) : <EmptyState compact icon="clock" title={t("admB2bB.noTimeline")} />}
      </QueryBoundary>
    </FormSheet>
  );
}
