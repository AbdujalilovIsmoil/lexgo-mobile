import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { radius, useColors } from "@/shared/theme";
import { Icon, Text, type IconName } from "@/shared/ui";

const STEPS: { k: "how1" | "how2" | "how3"; icon: IconName }[] = [
  { k: "how1", icon: "send" },
  { k: "how2", icon: "user-plus" },
  { k: "how3", icon: "percent" },
];

// «Qanday ishlaydi?» — three compact steps in a row.
export function HowStrip() {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.wrap}>
      <Text variant="h4">{t("refUx.howTitle")}</Text>
      <View style={s.row}>
        {STEPS.map((x, i) => (
          <View key={x.k} style={s.step} accessible accessibilityLabel={`${i + 1}. ${t(`refUx.${x.k}`)}`}>
            <View style={[s.icon, { backgroundColor: c.tint2 }]}>
              <Icon name={x.icon} size={20} tone="accent" />
            </View>
            <Text variant="caption" center weight="semibold">{`${i + 1}. ${t(`refUx.${x.k}`)}`}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: "row", gap: 10 },
  step: { flex: 1, alignItems: "center", gap: 8 },
  icon: { width: 48, height: 48, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
});
