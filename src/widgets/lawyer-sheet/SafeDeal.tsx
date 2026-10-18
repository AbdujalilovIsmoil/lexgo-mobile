import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// "Safe purchase": the three guarantees shown beside the buy button on the web.
export function SafeDeal() {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={[s.box, { backgroundColor: c.okBg }]}>
      <View style={s.head}><Icon name="shield" size={18} color={c.ok} /><Text variant="small" weight="bold">{t("mk2.safeTitle")}</Text></View>
      {(["safe1", "safe2", "safe3"] as const).map((k) => <Text key={k} variant="caption" tone="gray">{`• ${t(`mk2.${k}`)}`}</Text>)}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: 16, padding: 14, gap: 6 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
});
