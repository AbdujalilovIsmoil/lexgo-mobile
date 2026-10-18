import { memo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { humanizeSlug } from "@/shared/lib/format";
import { selectHaptic } from "@/shared/lib/haptics";
import { radius, useColors } from "@/shared/theme";
import { subtitleOf } from "../lib/selection";
import type { Person } from "../model/usePeople";
import { CheckCircle } from "./CheckCircle";

type Props = { person: Person; picked: boolean; multi: boolean; busy?: boolean; onPress: (p: Person) => void };

// One result of the picker: big monogram, name, one-line subtitle and a round checkbox on the right (multi) or a chevron
// (single). The whole row is the tap target; a picked row only gets a soft tint, so the list never jumps.
export const PickRow = memo(function PickRow({ person, picked, multi, busy, onPress }: Props) {
  const c = useColors();
  const name = person.name || person.phone || "?";
  const sub = subtitleOf(person, humanizeSlug(person.role));
  return (
    <PressableScale
      haptic={false}
      scale={0.985}
      onPress={() => { selectHaptic(); onPress(person); }}
      accessibilityRole={multi ? "checkbox" : "button"}
      accessibilityLabel={sub && sub !== name ? `${name}, ${sub}` : name}
      accessibilityState={multi ? { checked: picked } : { busy: !!busy }}
      style={[s.row, { backgroundColor: picked ? c.tint : "transparent" }]}
    >
      <Avatar name={name} size={48} />
      <View style={s.col}>
        <Text variant="body" weight="semibold" numberOfLines={1}>{name}</Text>
        {sub ? <Text variant="small" tone="gray" numberOfLines={1}>{sub}</Text> : null}
      </View>
      {multi ? <CheckCircle on={picked} /> : busy ? <ActivityIndicator color={c.accent} /> : <Icon name="chevron-right" size={18} tone="gray" />}
    </PressableScale>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 68, paddingVertical: 10, paddingHorizontal: 18, borderRadius: radius.r },
  col: { flex: 1, gap: 2 },
});
