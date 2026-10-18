import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// "Yuridik yordam endi / bir necha tegishda" — accent line in the cyan hero tint.
export function HeroTitle() {
  const { t } = useT();
  return (
    <View style={s.wrap}>
      <Text variant="hx" tone="white">
        {t("home.heroLead")}
      </Text>
      <Text variant="hx" style={s.accent}>
        {t("home.heroAccent")}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 6 },
  accent: { color: "#8FD8FF" },
});
