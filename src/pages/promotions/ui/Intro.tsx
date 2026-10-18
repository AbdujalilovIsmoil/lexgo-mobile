import { StyleSheet, View } from "react-native";
import { Kicker, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Plain heading block (no band): kicker chip, title, one-line lead. Read as one heading by screen readers.
export function Intro() {
  const { t } = useT();
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={`${t("promoSeller.title")}. ${t("promoSeller.intro")}`} style={s.box}>
      <Kicker label={t("promoSeller.kicker")} />
      <Text variant="h2">{t("promoSeller.title")}</Text>
      <Text variant="body" tone="gray">{t("promoSeller.intro")}</Text>
    </View>
  );
}

const s = StyleSheet.create({ box: { gap: 2, paddingTop: 4 } });
