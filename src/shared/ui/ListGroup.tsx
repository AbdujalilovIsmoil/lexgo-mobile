import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@/shared/theme";
import { Icon } from "./Icon";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export type ListGroupItem = { key: string; title: string; sub?: string; right?: ReactNode; onPress?: () => void };

// Adliya's grouped list: one white card, rows split by a hairline — the title, a grey line under it and a chevron (when the row opens
// something). Used by the profile's pages (family, referral, …).
export function ListGroup({ items }: { items: ListGroupItem[] }) {
  const { colors: c, dark, glass } = useTheme();
  if (!items.length) return null;
  return (
    <View style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      {items.map((x, i) => {
        const body = (
          <>
            <View style={s.col}>
              <Text variant="body" weight="semibold" numberOfLines={2} style={s.title}>{x.title}</Text>
              {x.sub ? <Text variant="small" tone="gray" numberOfLines={2} style={s.sub}>{x.sub}</Text> : null}
            </View>
            {x.right}
            {x.onPress ? <Icon name="chevron-right" size={18} color={c.gray} /> : null}
          </>
        );
        const line = i > 0 ? { borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: dark || glass ? c.line : "#E2E8F1" } : null;
        return x.onPress ? (
          <PressableScale key={x.key} onPress={x.onPress} scale={0.99} accessibilityRole="button" accessibilityLabel={x.sub ? `${x.title}, ${x.sub}` : x.title} style={[s.row, line]}>{body}</PressableScale>
        ) : (
          <View key={x.key} style={[s.row, line]}>{body}</View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, overflow: Platform.OS === "android" ? "hidden" : "visible" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 15, minHeight: 64 },
  col: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontSize: 16, lineHeight: 21 },
  sub: { fontSize: 13.5, lineHeight: 18 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
