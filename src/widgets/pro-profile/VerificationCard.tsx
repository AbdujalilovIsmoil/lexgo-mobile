import { StyleSheet, View } from "react-native";
import { VerificationButton } from "@/features/pro-profile-edit";
import { Icon, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { verified: boolean; status: string; badge: string };

// Verification badge state and the "ask for a check" action (clients only see verified sellers).
export function VerificationCard({ verified, status, badge }: Props) {
  const { t } = useT();
  const c = useColors();
  const key = verified ? "approved" : /^(rejected|declined)$/.test(status) ? "rejected" : "pending";
  return (
    <SectionCard title={t("sl4.verification")}>
      <View style={s.row}>
        <Icon name={verified ? "check-circle" : key === "rejected" ? "x-circle" : "clock"} size={22} color={verified ? c.ok : key === "rejected" ? c.err : c.warn} />
        <View style={s.col}>
          <Text variant="body" weight="semibold">{badge || t(`sl4.vstate.${key}`)}</Text>
          <Text variant="caption" tone="gray">{t(`sl4.vtext.${key}`)}</Text>
        </View>
      </View>
      {verified ? null : <VerificationButton />}
    </SectionCard>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", gap: 12, alignItems: "center" }, col: { flex: 1, gap: 2 } });
