import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { executorKey, type Service, type ServicePassport } from "@/entities/service";
import { valueKey } from "@/entities/service/lib/passportValues";
import { durationParts, useServiceRuntime } from "@/entities/service-runtime";
import { useColors } from "@/shared/theme";
import { Icon, Skeleton, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type TileProps = { icon: IconName; label: string; value: string; sub?: string; loading?: boolean; i: number };

function Tile({ icon, label, value, sub, loading, i }: TileProps) {
  const c = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(i * 70).duration(300)} style={[s.tile, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name={icon} size={16} color={c.accent} /></View>
      <Text variant="caption" tone="gray" numberOfLines={1}>{label}</Text>
      {loading ? <Skeleton height={14} width="70%" style={s.wait} /> : <Text variant="small" weight="bold" numberOfLines={2}>{value}</Text>}
      {sub && !loading ? <Text variant="caption" tone="gray" numberOfLines={1}>{sub}</Text> : null}
    </Animated.View>
  );
}

// The three facts that decide a purchase, side by side: how long it takes, who does it and in what format. A fact the backend
// does not give is simply not shown. The time is the marketplace's own (runtime configuration, TZ §4.3 — information only, its business
// week under it); the passport's text stands in only when the service has none, and the tile waits for it instead of changing under the eye.
export function ServiceFacts({ service, passport: p }: { service: Service; passport?: ServicePassport }) {
  const { t, locale } = useT();
  const rt = useServiceRuntime(service.id);
  const span = rt.data?.duration;
  const term = span ? durationParts(span, t, locale) : null;
  const days = p?.standardDuration && p.standardDuration !== "0" ? (/[^\d\s.,–-]/.test(p.standardDuration) ? p.standardDuration : t("csv.pp.daysText", { value: p.standardDuration })) : service.deliveryMinutes ? `${Math.round(service.deliveryMinutes / 60)} h` : "";
  const ex = executorKey(p?.executorType || service.executorType);
  const fk = valueKey(p?.format);
  const tiles = [
    { icon: "clock" as const, label: t("svh.term"), value: term?.text ?? days, sub: term?.days, loading: rt.isLoading },
    { icon: "user" as const, label: t("svh.who"), value: ex ? t(`dc1.executor.${ex}`) : "" },
    { icon: "monitor" as const, label: t("svh.format"), value: fk ? t(`csv.pp.formatValues.${fk}`) : p?.format ?? "" },
  ].filter((x) => x.value || x.loading);
  if (!tiles.length) return null;
  return <View style={s.row}>{tiles.map((x, i) => <Tile key={x.label} i={i} {...x} />)}</View>;
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, gap: 4, padding: 12, borderRadius: 16, borderWidth: 1 },
  ico: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  wait: { marginTop: 2 },
});
