import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// "Waiting on you" / "Other documents" divider between list groups: a coloured dot, the title and a count badge.
export function DocSectionHead({ kind, n }: { kind: "you" | "rest"; n: number }) {
  const { t } = useT();
  const c = useColors();
  const you = kind === "you";
  return (
    <View style={s.col}>
      <View style={s.row}>
        <View style={[s.dot, { backgroundColor: you ? c.warn : c.gray2 }]} />
        <Text variant="h4" style={s.flex}>{t(`dm11.sec${you ? "You" : "Rest"}`)}</Text>
        <View style={[s.badge, { backgroundColor: you ? c.warnBg : c.surface2 }]}><Text variant="caption" weight="bold">{n}</Text></View>
      </View>
      {you ? <Text variant="caption" tone="gray">{t("dm11.secYouHint")}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 3, paddingTop: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  flex: { flex: 1 },
  badge: { minWidth: 28, height: 24, paddingHorizontal: 8, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
