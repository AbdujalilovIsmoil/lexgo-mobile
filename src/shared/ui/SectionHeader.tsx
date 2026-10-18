import { StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { PressableScale } from "./PressableScale";
import { Icon } from "./Icon";

type Props = { title: string; sub?: string; actionLabel?: string; onAction?: () => void };

// .head--row: title left, "see all" link right.
export function SectionHeader({ title, sub, actionLabel, onAction }: Props) {
  return (
    <View style={s.row}>
      <View style={s.col}>
        <Text variant="h3">{title}</Text>
        {sub ? (
          <Text variant="small" tone="gray">
            {sub}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} style={s.link} hitSlop={8}>
          <Text variant="small" tone="accent" weight="semibold">
            {actionLabel}
          </Text>
          <Icon name="chevron-right" size={16} tone="accent" />
        </PressableScale>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  col: { flex: 1, gap: 3 },
  link: { flexDirection: "row", alignItems: "center", gap: 2, paddingBottom: 2 },
});
