import { StyleSheet, View } from "react-native";
import { Card, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const STEPS = ["s1", "s2", "s3"] as const;

// "Qanday ishlaydi" as a vertical timeline: numbered circles joined by a line.
export function ReferralSteps() {
  const { t } = useT();
  const c = useColors();
  return (
    <Card style={s.card}>
      <Text variant="h4">{t("py7.ref.how")}</Text>
      {STEPS.map((k, i) => (
        <View key={k} style={s.row}>
          <View style={s.rail}>
            <View style={[s.num, { backgroundColor: c.accent }]}><Text variant="caption" weight="bold" tone="white">{i + 1}</Text></View>
            {i < STEPS.length - 1 ? <View style={[s.stem, { backgroundColor: c.tint2 }]} /> : null}
          </View>
          <Text variant="small" style={s.txt}>{t(`py7.ref.${k}`)}</Text>
        </View>
      ))}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  row: { flexDirection: "row", gap: 12 },
  rail: { alignItems: "center", width: 28 },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stem: { width: 3, flex: 1, minHeight: 18, marginVertical: 2, borderRadius: 2 },
  txt: { flex: 1, paddingTop: 5, paddingBottom: 12 },
});
