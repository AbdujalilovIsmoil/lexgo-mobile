import { View } from "react-native";
import { useRegionLabel, type UrgentRequest } from "@/entities/admin-callcenter";
import { Button, Text } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { openTel } from "@/shared/lib/links";
import { useT } from "@/shared/i18n";

// Who asked (with a call button), who is on it, and the advocate panel of a group second opinion.
export function UrgentPeople({ req }: { req: UrgentRequest }) {
  const { t, locale } = useT();
  const region = useRegionLabel();
  const group = req.serviceKind === "second_opinion_group";
  return (
    <>
      <SectionCard title={t("admCc.client")}>
        <Text variant="body" weight="bold">{req.clientName || t("admCc.unknownClient")}</Text>
        <FactRows rows={[{ label: t("adm.phone"), value: req.clientPhone }, { label: "LexGo ID", value: req.client?.lexgoId }, { label: t("admCc.fRegion"), value: region(req.region) }]} />
        {req.clientPhone ? <Button title={t("adm.call")} icon="phone" size="sm" variant="soft" onPress={() => openTel(req.clientPhone)} /> : null}
      </SectionCard>
      <SectionCard title={t("admCc.assignment")}>
        <FactRows rows={[
          { label: t("admCc.claimedBy"), value: req.claimedBy?.name }, { label: t("admCc.operator"), value: req.operator?.name }, { label: t("admCc.assignedLawyer"), value: req.assignedLawyer?.name },
          { label: t("adm.created"), value: fmtDateTime(req.createdAt, locale) },
        ]} />
      </SectionCard>
      {group ? (
        <SectionCard title={t("admCc.panel")}>
          {req.groupLawyers.length ? req.groupLawyers.map((g) => <View key={g.id}><Text variant="body" weight="semibold">{g.name}</Text><Text variant="caption" tone="gray">{g.phone}</Text></View>) : <Text variant="small" tone="gray">{t("admCc.panelEmpty")}</Text>}
          {req.scheduledAt ? <Text variant="small">{t("admCc.scheduledFor", { when: fmtDateTime(req.scheduledAt, locale) })}</Text> : null}
          {req.meetingNote ? <Text variant="caption" tone="gray">{req.meetingNote}</Text> : null}
        </SectionCard>
      ) : null}
    </>
  );
}
