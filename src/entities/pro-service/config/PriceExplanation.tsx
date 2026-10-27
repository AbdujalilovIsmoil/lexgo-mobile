import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Text } from "@/shared/ui";

type Props = { text: string; lines?: string[] };

// LexGo's explanation of the price (price_explanation of the configuration); renders nothing without text.
export function PriceExplanation({ text, lines = [] }: Props) {
  const c = useColors();
  const { t } = useT();
  if (!text && !lines.length) return null;
  return (
    <View style={[s.box, { backgroundColor: c.tint }]} accessibilityLabel={t("svcRules.cfgExplanationTitle")}>
      <Text variant="h4">{t("svcRules.cfgExplanationTitle")}</Text>
      <Text variant="caption" tone="gray">{t("svcRules.cfgExplanationHint")}</Text>
      {lines.length ? lines.map((l, i) => <Text key={`${i}-${l}`} variant="small">{`• ${l}`}</Text>) : <Text variant="small">{text}</Text>}
    </View>
  );
}

const s = StyleSheet.create({ box: { gap: 4, padding: 14, borderRadius: radius.r } });
