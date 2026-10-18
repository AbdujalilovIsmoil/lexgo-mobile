import { useCcLabel, type UrgentRequest } from "@/entities/admin-callcenter";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Why a second opinion is allowed (earlier LexGo purchases) and every status the record has been through.
export function UrgentHistory({ req }: { req: UrgentRequest }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  const second = req.serviceKind === "second_opinion_group" || req.serviceKind === "second_opinion_single";
  return (
    <>
      {second && req.sources.length ? (
        <SectionCard title={t("admCc.eligibleSources")}>
          <Text variant="caption" tone="gray">{t("admCc.eligibleSourcesLead")}</Text>
          <FactRows rows={req.sources.map((s) => ({ label: s.title || label("admCc.srcType", s.type), value: [label("admCc.stat", s.status), fmtDateTime(s.createdAt, locale)].filter(Boolean).join(" · ") }))} />
        </SectionCard>
      ) : null}
      {req.history.length ? (
        <SectionCard title={t("admCc.history")}>
          <FactRows rows={req.history.map((h) => ({ label: label("admCc.stat", h.to), value: fmtDateTime(h.at, locale) || "—" }))} />
        </SectionCard>
      ) : null}
    </>
  );
}
