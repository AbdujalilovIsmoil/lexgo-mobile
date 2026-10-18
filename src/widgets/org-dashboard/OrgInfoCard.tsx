import { View } from "react-native";
import { Button } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { openTel } from "@/shared/lib/links";
import { useT } from "@/shared/i18n";
import { OrgStatus, useOrgText, type Organization } from "@/entities/organization";
import { ExportButton } from "@/features/org-export";

// The organization's registration data, with call and the CSV export of the workload.
export function OrgInfoCard({ org, nameOf }: { org: Organization; nameOf: (id: string) => string }) {
  const { t, locale } = useT();
  const text = useOrgText();
  return (
    <SectionCard title={t("og1.about")}>
      <FactRows rows={[
        { label: t("adm.status"), value: <OrgStatus status={org.verification} small={false} /> },
        { label: t("og1.inn"), value: org.inn },
        { label: t("og1.region"), value: text.region(org.region) },
        { label: t("og1.address"), value: org.address },
        { label: t("adm.phone"), value: org.phone },
        { label: t("adm.created"), value: fmtDate(org.createdAt, locale) },
      ]} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        {org.phone ? <Button title={t("adm.call")} icon="phone" variant="line" size="sm" onPress={() => openTel(org.phone)} /> : null}
        <ExportButton orgId={org.id} nameOf={nameOf} />
      </View>
    </SectionCard>
  );
}
