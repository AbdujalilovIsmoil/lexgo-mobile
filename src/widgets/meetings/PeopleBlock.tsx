import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { AvatarStack, type Person } from "@/entities/person-search";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { picked: Person[]; error?: boolean; onOpen: () => void };

// "Participants" block of the new-meeting sheet: an overlapping avatar stack with the count, then a "+" row that opens the picker page.
export function PeopleBlock({ picked, error, onOpen }: Props) {
  const { t } = useT();
  const c = useColors();
  const n = picked.length;
  return (
    <View style={s.wrap}>
      <Text variant="small" tone="gray">{t("meetUx.people")}</Text>
      <View style={[s.well, { backgroundColor: c.surface2, borderColor: error ? c.err : c.line }]}>
        {n ? (
          <PressableScale onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${t("meetUx.peopleN", { n })}: ${picked.map((p) => p.name || p.phone).join(", ")}`} style={s.stack}>
            <AvatarStack names={picked.map((p) => p.name || p.phone || "?")} size={38} />
            <Text variant="body" weight="semibold" style={s.grow}>{t("meetUx.peopleN", { n })}</Text>
            <Icon name="chevron-right" size={18} tone="gray" />
          </PressableScale>
        ) : null}
        <PressableScale onPress={onOpen} accessibilityRole="button" accessibilityLabel={t("meetUx.addPeople")} style={s.add}>
          <View style={[s.plus, { backgroundColor: c.tint2 }]}><Icon name="plus" size={20} color={c.accent} /></View>
          <View style={s.grow}>
            <Text variant="body" weight="semibold" style={{ color: c.accentStrong }}>{t("meetUx.addPeople")}</Text>
            {n ? null : <Text variant="caption" tone="gray">{t("meetUx.peopleHint")}</Text>}
          </View>
        </PressableScale>
      </View>
      {error ? <Text variant="small" tone="err" accessibilityRole="alert" accessibilityLiveRegion="polite">{t("meetUx.needPeople")}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8 },
  well: { borderRadius: radius.r, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 4 },
  stack: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56 },
  add: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56 },
  plus: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  grow: { flex: 1 },
});
