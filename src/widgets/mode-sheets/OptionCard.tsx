import { StyleSheet } from "react-native";
import { useColors } from "@/shared/theme";
import { Card, Icon, Pill, Text, type IconName } from "@/shared/ui";

type Props = { icon: IconName; title: string; text: string; price?: string; unit?: string; selected?: boolean; onPress?: () => void; tone?: string };

// A choice card: icon, title, short text, price pill. Selected → accent outline.
// It fills its grid cell, so cards in one row always share one height.
export function OptionCard({ icon, title, text, price, unit, selected, onPress, tone }: Props) {
  const c = useColors();
  const color = tone ?? c.accent;
  return (
    <Card onPress={onPress} style={[s.card, selected && { borderColor: color, borderWidth: 2 }]}>
      <Icon name={icon} size={22} color={color} />
      <Text variant="h4" numberOfLines={2}>{title}</Text>
      <Text variant="caption" tone="gray" numberOfLines={4} style={s.text}>{text}</Text>
      {price ? <Pill label={`${price} ${unit ?? ""}`.trim()} tone="blue" small /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, gap: 6, padding: 14, minHeight: 150 },
  text: { flex: 1 },
});
