import { View } from "react-native";
import { Avatar, Button, Card, Pill, Text } from "@/shared/ui";
import { humanizeSlug } from "@/shared/lib/format";
import { openTel } from "@/shared/lib/links";
import { useT } from "@/shared/i18n";
import { OrgStatus, WorkloadChips, useOrgText, type OrgMember } from "@/entities/organization";

// Profile card of one member: who, role in the organization, verification, rating, specialisations, workload.
export function MemberHeader({ member: m, onEditRole }: { member: OrgMember; onEditRole: () => void }) {
  const { t } = useT();
  const text = useOrgText();
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Avatar name={m.name || "?"} size={56} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="h4" numberOfLines={2}>{m.name || "—"}</Text>
          <Text variant="small" tone="gray" numberOfLines={1}>{[m.title, text.kind(m.sellerType)].filter(Boolean).join(" · ")}</Text>
          {m.lexgoId ? <Text variant="caption" tone="gray2">{m.lexgoId}</Text> : null}
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        <OrgStatus status={m.verification} />
        {m.status !== "active" ? <OrgStatus status={m.status} /> : null}
        {m.reviews > 0 ? <Pill label={`★ ${m.rating.toFixed(1)} · ${m.reviews}`} tone="warn" small /> : <Pill label={t("og3.unrated")} tone="gray" small />}
        {m.specializations.slice(0, 4).map((s) => <Pill key={s} label={humanizeSlug(s)} tone="blue" small />)}
      </View>
      <WorkloadChips w={m.workload} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button title={t("og3.editRole")} icon="edit-2" variant="soft" size="sm" onPress={onEditRole} />
        {m.phone ? <Button title={t("adm.call")} icon="phone" variant="line" size="sm" onPress={() => openTel(m.phone)} /> : null}
      </View>
    </Card>
  );
}
