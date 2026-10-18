import { StyleSheet, View } from "react-native";
import { countBy, STATUS_ICON, type ProService, type ServiceFilter } from "@/entities/pro-service";
import { Button, GradientBox, Icon, PressableScale, Skeleton, Text, type IconName } from "@/shared/ui";
import { radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = {
  items: ProService[];
  loading?: boolean;
  filter: ServiceFilter;
  onFilter: (f: ServiceFilter) => void;
  waiting: number; // promotion requests still waiting for the admin
  running: number; // promotions running right now (a boosted catalogue service need not be one of the seller's own services)
  onAdd: () => void;
};

// Colours that read on the blue gradient (white text / light tints are right here).
const ON_BLUE = { active: "#6EE7B7", paused: "#FCD34D", inactive: "#CFE2FF", promoted: "#67E8F9" };

type TileProps = { icon: IconName; color: string; count: number; label: string; loading?: boolean; on?: boolean; onPress?: () => void; hint?: string };
// One counter: icon, number and a one-line label. Four of them share the row equally, so no label can push the layout around.
function Tile({ icon, color, count, label, loading, on, onPress, hint }: TileProps) {
  const body = (
    <>
      <Icon name={icon} size={15} color={color} />
      {loading ? <Skeleton height={20} width={18} /> : <Text variant="h3" tone="white" numberOfLines={1}>{count}</Text>}
      <Text variant="caption" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={s.label}>{label}</Text>
    </>
  );
  const style = [s.tile, on && s.tileOn];
  if (!onPress) return <View accessible accessibilityLabel={`${label}: ${count}${hint ? `, ${hint}` : ""}`} style={style}>{body}</View>;
  return <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${count}`} accessibilityState={{ selected: !!on }} style={style}>{body}</PressableScale>;
}

// Slim blue band: title with a one-line summary, four equal counters (the first three filter the list) and the "add a service"
// button centred at the bottom of the card.
export function ServicesHero({ items, loading, filter, onFilter, waiting, running, onAdd }: Props) {
  const { t } = useT();
  const n = countBy(items);
  const pick = (f: ServiceFilter) => onFilter(filter === f ? "all" : f);
  return (
    <GradientBox variant="dark" round={radius.rx} style={s.box}>
      <View style={s.title}>
        <Text variant="h3" tone="white" numberOfLines={1}>{t("proSvc.title")}</Text>
        <Text variant="small" numberOfLines={1} style={s.sub}>{loading ? " " : t("proSvc.hero.count", { n: n.all, active: n.active })}</Text>
      </View>
      <View style={s.tiles}>
        <Tile icon={STATUS_ICON.active} color={ON_BLUE.active} count={n.active} label={t("proSvc.stats.active")} loading={loading} on={filter === "active"} onPress={() => pick("active")} />
        <Tile icon={STATUS_ICON.paused} color={ON_BLUE.paused} count={n.paused} label={t("proSvc.stats.paused")} loading={loading} on={filter === "paused"} onPress={() => pick("paused")} />
        <Tile icon={STATUS_ICON.inactive} color={ON_BLUE.inactive} count={n.inactive} label={t("proSvc.stats.inactive")} loading={loading} on={filter === "inactive"} onPress={() => pick("inactive")} />
        <Tile icon="radio" color={ON_BLUE.promoted} count={Math.max(n.promoted, running)} label={t("proSvc.stats.promoted")} loading={loading} hint={waiting ? t("proSvc.stats.waiting", { n: waiting }) : undefined} />
      </View>
      <View style={s.add}>
        <Button title={t("proSvc.add")} icon="plus" variant="gradient" size="sm" onPress={onAdd} style={s.addBtn} />
      </View>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  box: { padding: 16, gap: 14 },
  title: { gap: 2 },
  sub: { color: "#CFE2FF" },
  tiles: { flexDirection: "row", gap: 8 },
  add: { alignItems: "center" },
  addBtn: { alignSelf: "center" }, // Button pins itself to the start edge; this puts it in the middle
  tile: { flex: 1, minHeight: 72, alignItems: "center", justifyContent: "center", gap: 2, paddingHorizontal: 4, borderRadius: radius.r, borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", backgroundColor: "rgba(255,255,255,0.10)" },
  tileOn: { backgroundColor: "rgba(255,255,255,0.24)", borderColor: "rgba(255,255,255,0.6)" },
  label: { color: "#E6F0FF" },
});
