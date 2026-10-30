import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { AREA_KEYS, REGION_KEYS, useGeoLabels, type Lawyer } from "@/entities/lawyer";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useRecentSearches } from "../model/recentSearches";

const fold = (s: string) => s.toLowerCase().replace(/[ʻʼ'`‘’]/g, "'");

export type Pick =
  | { kind: "lawyer"; id: string }
  | { kind: "area"; key: string }
  | { kind: "service"; id: string; title: string }
  | { kind: "region"; key: string }
  | { kind: "text"; q: string }
  | { kind: "ai"; q: string };

type Row = { key: string; icon: IconName; title: string; sub?: string; pick: Pick };

// Google-like suggestions under the directory's search field. With nothing typed: the recent searches and the popular practice areas.
// While typing: specialists by name, practice areas, services and regions that contain the words (the typed part in bold), then "all
// results" and "search with AI". Built from what the app already has: the loaded specialists, their services, the area and region lists.
export function SearchSuggest({ text, lawyers, onPick }: { text: string; lawyers: Lawyer[]; onPick: (p: Pick) => void }) {
  const { t } = useT();
  const c = useColors();
  const geo = useGeoLabels();
  const recent = useRecentSearches((s) => s.items);
  const clearRecent = useRecentSearches((s) => s.clear);
  const q = text.trim();
  const needle = fold(q);
  const has = (s: string) => !!needle && fold(s).includes(needle);
  const groups: { title: string; rows: Row[]; action?: { label: string; onPress: () => void } }[] = [];
  if (!q) {
    if (recent.length) groups.push({ title: t("mk1.dir.recent"), action: { label: t("mk1.dir.clearRecent"), onPress: clearRecent }, rows: recent.map((r) => ({ key: `r${r}`, icon: "clock", title: r, pick: { kind: "text", q: r } })) });
    groups.push({ title: t("mk1.dir.popular"), rows: AREA_KEYS.slice(0, 5).map((a) => ({ key: `p${a}`, icon: "trending-up", title: geo.area(a), pick: { kind: "area", key: a } })) });
  } else {
    const people = lawyers.filter((l) => has(l.name)).slice(0, 4);
    if (people.length) groups.push({ title: t("mk1.dir.sLawyers"), rows: people.map((l) => ({ key: `l${l.id}`, icon: "user", title: l.name, sub: [t(l.kind === "advocate" ? "mkw.roles.advokat" : "mkw.roles.yurist"), l.region ? geo.region(l.region) : ""].filter(Boolean).join(" · "), pick: { kind: "lawyer", id: l.userId || l.id } })) });
    const areas = AREA_KEYS.filter((a) => has(geo.area(a))).slice(0, 3);
    if (areas.length) groups.push({ title: t("mk1.dir.sAreas"), rows: areas.map((a) => ({ key: `a${a}`, icon: "briefcase", title: geo.area(a), pick: { kind: "area", key: a } })) });
    const seen = new Set<string>();
    const services = lawyers.flatMap((l) => l.services).filter((x) => x.title && has(x.title) && !seen.has(x.title.toLowerCase()) && seen.add(x.title.toLowerCase())).slice(0, 3);
    if (services.length) groups.push({ title: t("mk1.dir.sServices"), rows: services.map((x) => ({ key: `s${x.id}`, icon: "file-text", title: x.title, pick: { kind: "service", id: x.id, title: x.title } })) });
    const regions = REGION_KEYS.filter((r) => has(geo.region(r))).slice(0, 3);
    if (regions.length) groups.push({ title: t("mk1.dir.sRegions"), rows: regions.map((r) => ({ key: `g${r}`, icon: "map-pin", title: geo.region(r), pick: { kind: "region", key: r } })) });
    groups.push({ title: "", rows: [
      { key: "all", icon: "search", title: t("mk1.dir.searchAll", { q }), pick: { kind: "text", q } },
      { key: "ai", icon: "star", title: t("mk1.dir.askAi", { q }), pick: { kind: "ai", q } },
    ] });
  }
  const bold = (s: string) => {
    const i = needle ? fold(s).indexOf(needle) : -1;
    if (i < 0) return <Text variant="body" numberOfLines={1}>{s}</Text>;
    return <Text variant="body" numberOfLines={1}>{s.slice(0, i)}<Text variant="body" weight="bold">{s.slice(i, i + q.length)}</Text>{s.slice(i + q.length)}</Text>;
  };
  return (
    <View style={[s.panel, { backgroundColor: c.surface, borderColor: c.line }]}>
      {groups.map((g, gi) => (
        <Fragment key={g.title || `g${gi}`}>
          {g.title ? (
            <View style={[s.head, gi > 0 && { borderTopColor: c.line, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <Text variant="caption" weight="bold" tone="gray" style={s.headTx}>{g.title.toUpperCase()}</Text>
              {g.action ? <PressableScale onPress={g.action.onPress} hitSlop={8}><Text variant="caption" weight="bold" tone="accent">{g.action.label}</Text></PressableScale> : null}
            </View>
          ) : <View style={[s.split, { backgroundColor: c.line }]} />}
          {g.rows.map((r) => (
            <PressableScale key={r.key} onPress={() => onPick(r.pick)} scale={0.99} accessibilityRole="button" style={s.row}>
              <View style={[s.ico, { backgroundColor: r.pick.kind === "ai" ? "rgba(47,107,255,0.12)" : c.surface2 }]}><Icon name={r.icon} size={16} color={r.pick.kind === "ai" ? c.accent : c.gray} /></View>
              <View style={s.flex}>
                {r.pick.kind === "text" || r.pick.kind === "ai" ? <Text variant="body" weight={r.pick.kind === "ai" ? "semibold" : "regular"} numberOfLines={1} style={r.pick.kind === "ai" ? { color: c.accent } : undefined}>{r.title}</Text> : bold(r.title)}
                {r.sub ? <Text variant="caption" tone="gray" numberOfLines={1}>{r.sub}</Text> : null}
              </View>
              <Icon name={r.pick.kind === "text" && !q ? "arrow-up-left" : "chevron-right"} size={16} tone="gray" />
            </PressableScale>
          ))}
        </Fragment>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  panel: { marginHorizontal: 16, borderRadius: 20, borderWidth: 1, paddingBottom: 6, overflow: "hidden" },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  headTx: { letterSpacing: 0.6 },
  split: { height: StyleSheet.hairlineWidth, marginTop: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  ico: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0 },
});
