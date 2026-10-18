import { Button, Text } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { isGroupKind, type UrgentRequest } from "@/entities/urgent";
import { openTel } from "@/shared/lib/links";
import { useT } from "@/shared/i18n";

// Who is on it. Staff also see the client (with a call button); the client sees who will help them.
export function DetailPeople({ req, staff }: { req: UrgentRequest; staff: boolean }) {
  const { t } = useT();
  const rows = [
    { label: t("ug7.assignedLawyer"), value: req.assignedLawyer?.name },
    { label: t("ug7.claimedBy"), value: staff ? req.claimedBy?.name : "" },
    { label: t("ug7.operator"), value: req.operator?.name },
  ];
  return (
    <>
      {staff ? (
        <SectionCard title={t("ug7.client")}>
          <Text variant="body" weight="bold">{req.clientName || t("ug7.unknownClient")}</Text>
          <FactRows rows={[{ label: t("adm.phone"), value: req.clientPhone }, { label: "LexGo ID", value: req.client?.lexgoId }]} />
          {req.clientPhone ? <Button title={t("adm.call")} icon="phone" size="sm" variant="soft" onPress={() => openTel(req.clientPhone)} /> : null}
        </SectionCard>
      ) : null}
      {rows.some((r) => r.value) ? <SectionCard title={t("ug7.assignment")}><FactRows rows={rows} /></SectionCard> : null}
      {isGroupKind(req) ? (
        <SectionCard title={t("ug7.panel")}>
          {req.groupLawyers.length ? req.groupLawyers.map((g) => <Text key={g.id} variant="body" weight="semibold">{g.name}{staff && g.phone ? `  ·  ${g.phone}` : ""}</Text>) : <Text variant="small" tone="gray">{t("ug7.panelEmpty")}</Text>}
        </SectionCard>
      ) : null}
    </>
  );
}
