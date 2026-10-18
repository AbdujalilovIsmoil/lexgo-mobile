import { StyleSheet, View } from "react-native";
import { Icon, Pill, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";

type Props = { icon: IconName; ok: boolean; title: string; text: string; badge?: string };

// Status block of a security card: round icon (green when on), title, one line of text, optional badge.
export function StatusBox({ icon, ok, title, text, badge }: Props) {
  const c = useColors();
  const tint = ok ? c.ok : c.gray;
  return (
    <View style={[s.box, { backgroundColor: c.surface2 }]}>
      <View style={[s.icon, { backgroundColor: `${tint}22` }]}><Icon name={icon} size={20} color={tint} /></View>
      <View style={s.col}>
        <Text variant="body" weight="bold">{title}</Text>
        <Text variant="caption" tone="gray">{text}</Text>
      </View>
      {badge ? <Pill label={badge} tone="ok" icon="check" small /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.r },
  icon: { width: 40, height: 40, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
});
