import { StyleSheet, View } from "react-native";
import { Avatar, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { stackOverlap, stackPlan } from "../lib/avatarStack";

type Props = { names: string[]; size?: number; max?: number };

// Overlapping avatars of a group; when there are more than `max`, the last slot is a "+N" bubble.
export function AvatarStack({ names, size = 36, max = 5 }: Props) {
  const c = useColors();
  const { shown, extra } = stackPlan(names.length, max);
  const gap = -stackOverlap(size);
  const ring = { borderColor: c.surface, borderRadius: size / 2 + 2 };
  return (
    <View style={s.row} accessible accessibilityLabel={names.join(", ")}>
      {names.slice(0, shown).map((n, i) => <View key={`${n}-${i}`} style={[s.ring, ring, i > 0 && { marginLeft: gap }]}><Avatar name={n || "?"} size={size} /></View>)}
      {extra ? (
        <View style={[s.ring, ring, shown > 0 && { marginLeft: gap }]}>
          <View style={[s.more, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.tint2 }]}><Text variant="caption" weight="bold" style={{ color: c.accentStrong }}>+{extra}</Text></View>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  ring: { borderWidth: 2, borderRadius: radius.pill },
  more: { alignItems: "center", justifyContent: "center" },
});
