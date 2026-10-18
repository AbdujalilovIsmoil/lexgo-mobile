import { Text } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// The result once completed, the reason once cancelled, the status history and (staff) why a second opinion is open.
export function DetailOutcome({ req, staff }: { req: UrgentRequest; staff: boolean }) {
  const { t, locale } = useT();
  const label = useUrgentLabels();
  const second = req.serviceKind.startsWith("second_opinion");
  return (
    <>
      {req.resultSummary || req.nextAction ? (
        <SectionCard title={t("ug7.result")}>
          {req.resultSummary ? <Text variant="body">{req.resultSummary}</Text> : null}
          {req.nextAction ? <Text variant="small" tone="gray">{`${t("ug7.nextAction")}: ${req.nextAction}`}</Text> : null}
          {req.completedAt ? <Text variant="caption" tone="gray2">{fmtDateTime(req.completedAt, locale)}</Text> : null}
        </SectionCard>
      ) : null}
      {req.cancelReason ? (
        <SectionCard title={t("ug7.cancelled")}>
          <Text variant="body">{req.cancelReason}</Text>
          {req.cancelledAt ? <Text variant="caption" tone="gray2">{fmtDateTime(req.cancelledAt, locale)}</Text> : null}
        </SectionCard>
      ) : null}
      {staff && second && req.sources.length ? (
        <SectionCard title={t("ug7.sources")}>
          <Text variant="caption" tone="gray">{t("ug7.sourcesLead")}</Text>
          <FactRows rows={req.sources.map((s) => ({ label: s.title || label.source(s.type), value: [label.status(s.status), fmtDateTime(s.createdAt, locale)].filter(Boolean).join(" · ") }))} />
        </SectionCard>
      ) : null}
      {req.history.length ? (
        <SectionCard title={t("ug7.history")}>
          <FactRows rows={req.history.map((h) => ({ label: label.status(h.to), value: fmtDateTime(h.at, locale) || "—" }))} />
        </SectionCard>
      ) : null}
    </>
  );
}
