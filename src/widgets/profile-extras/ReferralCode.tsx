import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The invite code as a dashed soft-blue "ticket" (Adliya) with a round copy button inside it (icon only: no label to overflow).
export function ReferralCode({ code, onCopy }: { code: string; onCopy: () => void }) {
  const { t } = useT();
  const { colors: c } = useTheme();
  return (
    <View style={[s.ticket, { borderColor: c.accent, backgroundColor: c.tint2 }]}>
      <Text variant="h2" selectable numberOfLines={1} adjustsFontSizeToFit style={s.code}>{code || "—"}</Text>
      <PressableScale onPress={onCopy} accessibilityRole="button" accessibilityLabel={t("adm.copy")} style={[s.copy, { backgroundColor: c.accent }]}><Icon name="copy" size={18} color="#FFFFFF" /></PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  ticket: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingLeft: 18, paddingRight: 10, borderRadius: 18, borderWidth: 1.5, borderStyle: "dashed" },
  code: { flex: 1, letterSpacing: 3 },
  copy: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
