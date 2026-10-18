import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { thinking: boolean; found: number; summary: string; disclaimer: string };

// Status line of the AI search: searching… / found N / the model's summary and the disclaimer.
export function AiBanner({ thinking, found, summary, disclaimer }: Props) {
  const c = useColors();
  const { t, locale } = useT();
  return (
    <View style={[s.box, { backgroundColor: c.tint, borderColor: c.line }]}>
      <View style={s.row}>
        <Icon name="zap" size={16} color={c.accent} />
        <Text variant="small" weight="bold" tone="accent">{thinking ? t("mk1.aiThinking") : t("mk1.aiFound", { n: found })}</Text>
      </View>
      {summary && !thinking ? <Text variant="small" tone="gray">{summary}</Text> : null}
      {!thinking ? <Text variant="caption" tone="gray2">{disclaimer && locale === "uz" ? disclaimer : t("mk1.aiDisclaimer")}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: 16, borderWidth: 1, padding: 12, gap: 5, marginVertical: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 7 },
});
