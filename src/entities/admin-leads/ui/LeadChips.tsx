import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Pill, Text, StageChip, ShiftButton } from "@/shared/ui";

export { StageChip, ShiftButton };

// Who owns the lead, like the foot of the web card: the initial in a small circle ("?" when nobody) and the name — muted when
// nobody, accent when it is the signed-in user.
export function AssigneeChip({ label, kind }: { label: string; kind: "none" | "me" | "op" }) {
  const c = useColors();
  const fg = kind === "me" ? c.accentStrong : kind === "op" ? c.ink : c.gray2;
  return (
    <View style={s.who}>
      <View style={[s.av, { backgroundColor: kind === "me" ? c.tint2 : c.surface2 }]}>
        <Text variant="caption" weight="bold" style={{ color: fg }}>{kind === "none" ? "?" : label.trim().charAt(0).toUpperCase()}</Text>
      </View>
      <Text variant="caption" weight="semibold" numberOfLines={1} style={[s.title, { color: fg }]}>{label}</Text>
    </View>
  );
}

// A grey tag of the web card (category, region, source).
export function LeadTag({ label }: { label: string }) {
  const c = useColors();
  return <View style={[s.tag, { backgroundColor: c.surface2 }]}><Text variant="caption" weight="semibold" tone="gray" numberOfLines={1}>{label}</Text></View>;
}

export const ScorePill = ({ score, label }: { score: string; label: string }) => <Pill small label={label} tone={score === "hot" ? "err" : score === "warm" ? "warn" : "blue"} />;

const s = StyleSheet.create({
  title: { flexShrink: 1 },
  who: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  av: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  tag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.pill, maxWidth: "100%" },
});
