import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Two quiet lines under the hero: a low rating opens a quality complaint by itself, and the operator chat for urgent questions.
export function ComplaintExtras() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  return (
    <Card style={s.card}>
      <View style={s.row}>
        <View style={[s.ico, { backgroundColor: c.warnBg }]}><Icon name="star" size={17} color={c.warn} /></View>
        <Text variant="small" tone="gray" style={s.txt}>{t("py5.auto")}</Text>
      </View>
      <View style={[s.sep, { backgroundColor: c.line }]} />
      <PressableScale onPress={() => router.push("/support")} accessibilityRole="button" style={s.row}>
        <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name="headphones" size={17} color={c.accent} /></View>
        <Text variant="small" weight="semibold" tone="accent" style={s.txt}>{t("pwc.chatLink")}</Text>
        <Icon name="arrow-right" size={17} tone="accent" />
      </PressableScale>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 12, padding: 14, borderRadius: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  ico: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1 },
  sep: { height: 1 },
});
