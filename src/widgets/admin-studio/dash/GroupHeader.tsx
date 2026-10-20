import { Image, StyleSheet, View } from "react-native";
import { Icon, Pill, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";
import { groupArt, groupMeta, useStudioText, useSummary, type StudioGroup } from "@/entities/admin-studio";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// One group of the studio as a card, like the web's: a wash of the group's colour in the corner, its icon and name, "done / total set
// up" with a bar, the next constructor to set up, and what is waiting inside it (returned, awaiting approval, awaiting publication).
export function GroupHeader({ group }: { group: StudioGroup }) {
  const { t } = useT();
  const { group: label, ctorName } = useStudioText();
  const c = useColors();
  const m = groupMeta(group.key);
  const art = groupArt(group.key);
  const by = useSummary().data?.byCode ?? {};
  const n = (...st: string[]) => group.items.reduce((sum, i) => sum + st.reduce((x, k) => x + (by[i.code]?.[k] ?? 0), 0), 0);
  const returned = n("changes_requested", "rejected");
  const review = n("submitted", "in_review");
  const publish = n("approved");
  const next = group.items.find((i) => i.code === group.next);
  const done = group.total > 0 && group.completed >= group.total;
  return (
    <View style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <View style={[s.wash, { backgroundColor: `${m.color}1F` }]} />
      <View style={s.row}>
        {art ? <Image source={art} resizeMode="contain" style={s.art} accessible={false} /> : <View style={[s.icon, { backgroundColor: `${m.color}26` }]}><Icon name={m.icon} size={20} color={m.color} /></View>}
        <View style={s.fill}>
          <Text variant="h4" numberOfLines={1}>{label(group.key, group.title)}</Text>
          <Text variant="caption" tone="gray">{t("admStudioD.groups.progress", { done: group.completed, total: group.total })}</Text>
        </View>
      </View>
      <ProgressBar value={group.total ? group.completed / group.total : 0} color={done ? c.ok : m.color} />
      <Text variant="small" weight="semibold" style={{ color: done ? c.ok : c.ink }} numberOfLines={1}>
        {done ? t("admStudioD.groups.allDone") : next ? t("admStudioD.groups.next", { name: ctorName(next.code, next.title) }) : ""}
      </Text>
      {returned || review || publish ? (
        <View style={s.pills}>
          {returned ? <Pill small tone="err" icon="rotate-ccw" label={t("admStudioD.groups.returned", { n: returned })} /> : null}
          {review ? <Pill small tone="warn" icon="clock" label={t("admStudioD.groups.review", { n: review })} /> : null}
          {publish ? <Pill small tone="ok" icon="upload-cloud" label={t("admStudioD.groups.publish", { n: publish })} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginTop: 16, padding: 16, gap: 10, borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  wash: { position: "absolute", top: -60, left: -50, width: 190, height: 190, borderRadius: 95 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  fill: { flex: 1 },
  art: { width: 56, height: 56, marginLeft: -4 },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
