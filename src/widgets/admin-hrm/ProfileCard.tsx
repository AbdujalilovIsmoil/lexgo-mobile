import { Linking, View } from "react-native";
import { HrmStatus, useNames, useProfile } from "@/entities/admin-hrm";
import { FactRows } from "@/shared/ui/admin";
import { CcAction } from "@/shared/ui/cc";
import { Avatar, Card, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// The signed-in employee: big avatar, name, position · code, status, call / email buttons and placement facts.
export function ProfileCard() {
  const { t, locale } = useT();
  const names = useNames();
  const p = useProfile().data;
  const e = p?.employee;
  const a = e?.assignment;
  const phone = e?.phone || p?.phone;
  return (
    <Card style={{ gap: 14 }}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Avatar name={e?.name || p?.name || "?"} size={84} />
        <Text variant="h3" center numberOfLines={2}>{e?.name || p?.name}</Text>
        <Text variant="small" tone="gray" center>{[a ? names.position(a.positionId) : "", e?.code].filter(Boolean).join(" · ")}</Text>
        {e ? <HrmStatus status={e.status} /> : null}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
          {phone ? <CcAction icon="phone" label={t("admHrmW.call")} onPress={() => void Linking.openURL(`tel:${phone}`)} /> : null}
          {e?.email ? <CcAction icon="mail" label={t("admHrmW.email")} onPress={() => void Linking.openURL(`mailto:${e.email}`)} /> : null}
        </View>
      </View>
      <FactRows rows={[
        { label: t("adm.phone"), value: phone }, { label: "Email", value: e?.email }, { label: t("admHrmB.region"), value: e?.region },
        { label: t("admHrmB.unit"), value: a ? names.unit(a.unitId) : "" }, { label: t("admHrmB.manager"), value: a ? names.employee(a.managerId) : "" },
        { label: t("admHrm.hired"), value: fmtDate(e?.hireDate, locale) },
      ]} />
    </Card>
  );
}
