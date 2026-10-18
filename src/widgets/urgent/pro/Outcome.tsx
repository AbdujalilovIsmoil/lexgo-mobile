import { View } from "react-native";
import { isGroupKind, useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { Text } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { Card } from "./Card";

// The panel of a group second opinion, the result once completed, the reason once cancelled and why a second opinion is open.
export function Outcome({ req }: { req: UrgentRequest }) {
  const { t, locale } = useT();
  const label = useUrgentLabels();
  return (
    <View style={{ gap: 14 }}>
      {isGroupKind(req) ? (
        <Card icon="users" title={t("ug7.panel")}>
          {req.groupLawyers.length ? req.groupLawyers.map((g) => <Text key={g.id} variant="body" weight="semibold">{g.name}{g.phone ? `  ·  ${g.phone}` : ""}</Text>) : <Text variant="small" tone="gray">{t("ug7.panelEmpty")}</Text>}
        </Card>
      ) : null}
      {req.resultSummary || req.nextAction ? (
        <Card icon="check-circle" title={t("ug7.result")}>
          {req.resultSummary ? <Text variant="body">{req.resultSummary}</Text> : null}
          {req.nextAction ? <Text variant="small" tone="gray">{`${t("ug7.nextAction")}: ${req.nextAction}`}</Text> : null}
          {req.completedAt ? <Text variant="caption" tone="gray2">{fmtDateTime(req.completedAt, locale)}</Text> : null}
        </Card>
      ) : null}
      {req.cancelReason ? (
        <Card icon="x-circle" title={t("ug7.cancelled")}>
          <Text variant="body">{req.cancelReason}</Text>
          {req.cancelledAt ? <Text variant="caption" tone="gray2">{fmtDateTime(req.cancelledAt, locale)}</Text> : null}
        </Card>
      ) : null}
      {req.serviceKind.startsWith("second_opinion") && req.sources.length ? (
        <Card icon="layers" title={t("ug7.sources")}>
          <View><Text variant="caption" tone="gray">{t("ug7.sourcesLead")}</Text></View>
          <FactRows rows={req.sources.map((x) => ({ label: x.title || label.source(x.type), value: [label.status(x.status), fmtDateTime(x.createdAt, locale)].filter(Boolean).join(" · ") }))} />
        </Card>
      ) : null}
    </View>
  );
}
