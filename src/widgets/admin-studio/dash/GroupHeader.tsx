import { StyleSheet, View } from "react-native";
import { Icon, Pill, Text } from "@/shared/ui";
import { groupMeta, useStudioText, type StudioGroup } from "@/entities/admin-studio";
import { useColors } from "@/shared/theme";

// Header of one group: icon, title, "done / total" and the group's sequence (each code coloured by its state).
export function GroupHeader({ group }: { group: StudioGroup }) {
  const { t, group: label } = useStudioText();
  const c = useColors();
  const m = groupMeta(group.key);
  return (
    <View style={s.box}>
      <View style={s.row}>
        <View style={[s.icon, { backgroundColor: `${m.color}22` }]}><Icon name={m.icon} size={18} color={m.color} /></View>
        <View style={s.fill}>
          <Text variant="h4" numberOfLines={1}>{group.order}. {label(group.key, group.title)}</Text>
          <Text variant="caption" style={{ color: c.gray }}>{t("ntd.studioV2.progress", { done: group.completed, total: group.total })}{group.next ? ` · ${t("ntd.studioV2.next", { code: group.next })}` : ""}</Text>
        </View>
      </View>
      <View style={s.seq}>
        {group.items.map((i, k) => (
          <View key={i.code} style={s.row}>
            {k > 0 ? <Icon name="chevron-right" size={12} tone="gray" /> : null}
            <Pill label={i.code} tone={i.nav?.completed ? "ok" : i.nav?.availability === "blocked" ? "warn" : "gray"} small />
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 8, paddingTop: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 8 },
  fill: { flex: 1 },
  seq: { flexDirection: "row", flexWrap: "wrap", gap: 4, rowGap: 6 },
});
