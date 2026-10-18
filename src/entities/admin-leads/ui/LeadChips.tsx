import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, Pill, PressableScale, Text, type IconName } from "@/shared/ui";

const HEX = /^#[0-9a-f]{6}$/i;

// Current stage of a lead as a coloured chip; tapping it opens "move to…".
export function StageChip({ title, color, onPress }: { title: string; color: string; onPress?: () => void }) {
  const c = useColors();
  const tint = HEX.test(color) ? color : c.gray;
  return (
    <PressableScale onPress={onPress} disabled={!onPress} style={[s.chip, { backgroundColor: `${tint}22` }]}>
      <View style={[s.dot, { backgroundColor: tint }]} />
      <Text variant="caption" weight="bold" numberOfLines={1} style={[s.title, { color: tint }]}>{title}</Text>
      {onPress ? <Icon name="chevron-down" size={12} color={tint} /> : null}
    </PressableScale>
  );
}

// Who owns the lead: muted when nobody, accent when it is the signed-in user.
export function AssigneeChip({ label, kind }: { label: string; kind: "none" | "me" | "op" }) {
  const c = useColors();
  const fg = kind === "me" ? c.accentStrong : kind === "op" ? c.ink : c.gray2;
  return (
    <View style={[s.chip, { backgroundColor: kind === "me" ? c.tint2 : c.surface2 }]}>
      <Icon name="user" size={12} color={fg} />
      <Text variant="caption" weight="semibold" numberOfLines={1} style={[s.title, { color: fg }]}>{label}</Text>
    </View>
  );
}

export const ScorePill = ({ score, label }: { score: string; label: string }) => <Pill small label={label} tone={score === "hot" ? "err" : score === "warm" ? "warn" : "blue"} />;

// Small round arrow (move to the previous / next stage).
export function ShiftButton({ icon, disabled, onPress }: { icon: IconName; disabled: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <PressableScale onPress={onPress} disabled={disabled} hitSlop={6} style={[s.shift, { backgroundColor: c.tint2, opacity: disabled ? 0.35 : 1 }]}>
      <Icon name={icon} size={17} color={c.accent} />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 5, paddingHorizontal: 9, borderRadius: radius.pill, flexShrink: 1 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  title: { flexShrink: 1 },
  shift: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
});
