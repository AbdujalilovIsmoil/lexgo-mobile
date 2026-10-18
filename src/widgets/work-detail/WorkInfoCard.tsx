import { useT } from "@/shared/i18n";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { useWorkText, type WorkDetail } from "@/entities/work";
import { infoRows } from "./infoRows";

// Key facts of the work (ids, dates, the client's own request text, channel, result …).
export function WorkInfoCard({ detail }: { detail: WorkDetail }) {
  const { t, locale } = useT();
  const text = useWorkText();
  return (
    <SectionCard title={t("cl4.facts.title")}>
      <FactRows rows={infoRows(detail, t, locale, text.status)} />
    </SectionCard>
  );
}
