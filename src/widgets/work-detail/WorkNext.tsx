import { StyleSheet, View } from "react-native";
import { useWorkText } from "@/entities/work";
import { radius, useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// What the server says happens next, set apart from the facts so it is the first thing read.
export function WorkNext({ action }: { action: string }) {
  const c = useColors();
  const { t } = useT();
  const text = useWorkText();
  if (!action) return null;
  return (
    <View style={[s.box, { backgroundColor: c.tint, borderColor: c.accent }]}>
      <View style={[s.ico, { backgroundColor: c.accent }]}><Icon name="arrow-right" size={18} tone="white" /></View>
      <View style={s.col}>
        <Text variant="caption" weight="bold" tone="accent">{t("ntd.wdNext")}</Text>
        <Text variant="body" weight="semibold">{text.next(action)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.rl, borderWidth: 1 },
  ico: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
});
