import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { PressableScale } from "./PressableScale";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

type Props = {
  icon?: IconName;
  iconTone?: "blue" | "ok" | "err" | "warn" | "gray";
  title: string;
  sub?: string;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  danger?: boolean;
};

// Settings / menu row with a tinted icon box, like the portal sidebar items.
export function ListRow({ icon, iconTone = "blue", title, sub, right, onPress, chevron = true, danger }: Props) {
  const c = useColors();
  const tones = { blue: [c.tint2, c.accent], ok: [c.okBg, c.ok], err: [c.errBg, c.err], warn: [c.warnBg, c.warn], gray: [c.surface2, c.gray] };
  const [bg, fg] = tones[danger ? "err" : iconTone];
  const body = (
    <View style={s.row}>
      {icon ? (
        <View style={[s.icon, { backgroundColor: bg }]}>
          <Icon name={icon} size={18} color={fg} />
        </View>
      ) : null}
      <View style={s.col}>
        <Text variant="body" weight="semibold" numberOfLines={1} style={danger ? { color: c.err } : undefined}>
          {title}
        </Text>
        {sub ? (
          <Text variant="caption" tone="gray" numberOfLines={2}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right}
      {onPress && chevron ? <Icon name="chevron-right" size={18} tone="gray" /> : null}
    </View>
  );
  return onPress ? (
    <PressableScale onPress={onPress} scale={0.985}>
      {body}
    </PressableScale>
  ) : (
    body
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  icon: { width: 38, height: 38, borderRadius: radius.sm + 2, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
});
