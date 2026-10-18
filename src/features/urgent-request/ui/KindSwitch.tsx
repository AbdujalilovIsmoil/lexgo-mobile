import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { Field } from "@/shared/ui/admin";
import { radius, useColors } from "@/shared/theme";
import { kindIcon, kindTint, useUrgentLabels, type UrgentGroup, type UrgentService } from "@/entities/urgent";
import { useT } from "@/shared/i18n";

type Props = { group: UrgentGroup; services: UrgentService[]; value: string; onPick: (key: string) => void };

// A grouped card is one box on the list; which of its kinds is meant is chosen here, as radio cards that each say what they are.
export function KindSwitch({ group, services, value, onPick }: Props) {
  const { t } = useT();
  const c = useColors();
  const label = useUrgentLabels();
  const items = group.items.map((k) => services.find((s) => s.key === k)).filter((s): s is UrgentService => !!s);
  if (items.length < 2) return null;
  return (
    <Field label={t(`ug2.groupKind.${group.key}`)}>
      <View style={s.col}>
        {items.map((it) => {
          const on = it.key === value;
          const tint = kindTint(it.key);
          return (
            <PressableScale key={it.key} onPress={() => onPick(it.key)} scale={0.985} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.row, { borderColor: on ? tint : c.line, backgroundColor: on ? `${tint}18` : c.surface }]}>
              <View style={[s.icon, { backgroundColor: on ? tint : `${tint}22` }]}><Icon name={kindIcon(it.key)} size={18} color={on ? "#FFFFFF" : tint} /></View>
              <View style={s.flex}>
                <Text variant="body" weight="bold">{label.kind(it.key, it.title)}</Text>
                <Text variant="caption" tone="gray">{t(`ug1.about.${it.key}`)}</Text>
              </View>
              <View style={[s.dot, { borderColor: on ? tint : c.gray2 }]}>{on ? <View style={[s.fill, { backgroundColor: tint }]} /> : null}</View>
            </PressableScale>
          );
        })}
      </View>
    </Field>
  );
}

const s = StyleSheet.create({
  col: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.r, borderWidth: 1.5 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, gap: 1 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  fill: { width: 10, height: 10, borderRadius: 5 },
});
