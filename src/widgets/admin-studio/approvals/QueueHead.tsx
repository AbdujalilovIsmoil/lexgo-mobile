import { StyleSheet, View } from "react-native";
import { PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { title: string; count: number; hint?: string; tone: "mine" | "others" | "done"; sub?: boolean; open?: boolean; onToggle?: () => void };

// A heading of the queue: "Waiting for you: 3" (the colour of your work), its sub-groups, "With others", and the collapsible "Completed".
export function QueueHead({ title, count, hint, tone, sub, open, onToggle }: Props) {
  const { t } = useT();
  const c = useColors();
  const color = tone === "mine" ? c.accent : tone === "done" ? c.ok : c.gray;
  const body = (
    <View style={[s.row, sub && s.sub]}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <View style={s.fill}>
        <Text variant={sub ? "small" : "h4"} weight="bold" numberOfLines={1}>{title}</Text>
        {hint ? <Text variant="caption" tone="gray" numberOfLines={1}>{hint}</Text> : null}
      </View>
      <View style={[s.count, { backgroundColor: c.surface2 }]}><Text variant="caption" weight="bold">{count}</Text></View>
      {onToggle ? <Text variant="small" weight="bold" tone="accent">{t(open ? "admStudioD.appr.hide" : "admStudioD.appr.show")}</Text> : null}
    </View>
  );
  return onToggle ? <PressableScale onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: !!open }}>{body}</PressableScale> : body;
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 12, paddingBottom: 4 },
  sub: { paddingTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  fill: { flex: 1 },
  count: { minWidth: 26, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
});
