import type { Course } from "@/entities/admin-academy";
import { FactRows, FormSheet, StatusPill } from "@/shared/ui/admin";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

// One course (read only: the API has no update); drafts are not shown to clients.
export function CourseSheet({ item, onClose }: { item: Course | null; onClose: () => void }) {
  const { t, locale } = useT();
  const c = useKept(item);
  return (
    <FormSheet visible={!!item} onClose={onClose} title={c?.title ?? ""} subtitle={c?.workId}>
      {c ? (
        <FactRows rows={[
          { label: t("adm.status"), value: <StatusPill status={c.status} /> }, { label: t("ag6.course.category"), value: humanizeSlug(c.category) },
          { label: t("ag6.course.level"), value: humanizeSlug(c.level) }, { label: t("ag6.course.lessonsLabel"), value: String(c.lessons) },
          { label: t("ag6.course.minutesLabel"), value: String(c.minutes) }, { label: t("adm.price"), value: c.price ? `${fmtMoney(c.price)} ${t("adm.currency")}` : t("ag6.course.free") },
          { label: t("adm.created"), value: fmtDateTime(c.createdAt, locale) },
        ]} />
      ) : null}
    </FormSheet>
  );
}
