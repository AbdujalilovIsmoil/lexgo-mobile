import { Fragment, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useIsFocused } from "expo-router";
import { mapErrorKey, RADII, type MapSeller, type NearbySort, type SellerType } from "@/entities/market-map";
import { SellerSheet } from "@/features/market-map/SellerSheet";
import { useMapRealtime } from "@/features/market-map/useMapRealtime";
import { useNearby } from "@/features/market-map/useNearby";
import { useT } from "@/shared/i18n";
import { fmtRating } from "@/shared/lib/format";
import { openLocationSettings } from "@/shared/lib/geo/deviceLocation";
import { useInsets } from "@/shared/lib/insets";
import { radius, useColors } from "@/shared/theme";
import { Avatar, Button, EmptyState, Icon, Pill, PressableScale, Skeleton, Text, Toggle } from "@/shared/ui";
import { AdminPage, ChipBar } from "@/shared/ui/admin";
import { YandexMap, type MapPoint } from "@/widgets/yandex-map/YandexMap";

const TYPES: ("all" | SellerType)[] = ["all", "advokat", "yurist", "advokat_tashkiloti"];
const SORTS: NearbySort[] = ["nearest", "rating", "recommended"];

// /nearby — specialists near the client on the Yandex map with a synchronized list. The OS permission is asked only after the tap;
// a denial offers a point picked on the map. Radius 5 / 10 / 25 / 50 km, type, sort and "verified only" filter both the list (nearby
// search) and the map (the visible area's public markers). Locations are approximate; routes come from the backend.
export function NearbyPage() {
  const { t, locale } = useT();
  const c = useColors();
  const insets = useInsets();
  const focused = useIsFocused();
  const n = useNearby();
  const [mapDown, setMapDown] = useState(false);
  const [picking, setPicking] = useState(false);
  const [open, setOpen] = useState<MapSeller | null>(null);
  useMapRealtime(focused ? n.cfg : undefined, n.refresh);
  const items = n.nearby.data?.items;
  const list = useMemo(() => items ?? [], [items]);
  const points: MapPoint[] = useMemo(() => {
    const seen = new Set<string>();
    const out: MapPoint[] = [];
    for (const s of [...list, ...(n.viewport.data?.sellers ?? [])]) {
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      out.push({ id: s.id, kind: "seller", lat: s.lat, lon: s.lon, title: s.name, verified: s.verified });
    }
    for (const k of n.viewport.data?.clusters ?? []) out.push({ id: k.id, kind: "cluster", lat: k.lat, lon: k.lon, title: "", count: k.count, bbox: k.bbox });
    return out;
  }, [list, n.viewport.data]);
  const byId = (id: string) => list.find((x) => x.id === id) ?? n.viewport.data?.sellers.find((x) => x.id === id) ?? null;
  const showMap = !!n.cfg?.configured && !mapDown;
  const pickMode = picking || n.phase === "denied";
  const f = n.filters;
  const set = (p: Partial<typeof f>) => n.setFilters({ ...f, ...p });

  return (
    <AdminPage title={t("mmap.title")} subtitle={t("mmap.subtitle")}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        {showMap && n.cfg ? (
          <View style={[s.mapBox, { borderColor: c.glassLine }]}>
            <YandexMap
              config={n.cfg}
              height={300}
              points={points}
              selected={open?.id ?? null}
              me={n.origin && !n.origin.manual ? { lat: n.origin.lat, lon: n.origin.lon } : null}
              pickPoint={n.origin?.manual ? { lat: n.origin.lat, lon: n.origin.lon } : null}
              pick={pickMode}
              onBounds={(bbox, zoom) => n.setView({ bbox, zoom })}
              onMarker={(id) => setOpen(byId(id))}
              onPick={(p) => { setPicking(false); void n.pickManual(p); }}
              onError={() => setMapDown(true)}
            />
            {pickMode ? <View style={[s.mapHint, { backgroundColor: c.bg }]}><Icon name="crosshair" size={14} color={c.accent} /><Text variant="caption" weight="semibold">{t("mmap.tapToPick")}</Text></View> : null}
          </View>
        ) : n.cfg && !n.cfg.configured || mapDown ? (
          <Notice icon="map" tone="warn" text={t("mmap.mapDown")} />
        ) : (
          <Skeleton height={300} round={22} />
        )}

        {n.phase === "intro" || n.phase === "locating" ? (
          <View style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
            <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name="navigation" size={22} color={c.accent} /></View>
            <Text variant="h4">{t("mmap.introTitle")}</Text>
            <Text variant="small" tone="gray">{t("mmap.introText")}</Text>
            <Button title={t("mmap.showNear")} icon="crosshair" variant="gradient" full loading={n.phase === "locating"} onPress={() => void n.locate()} />
            {showMap ? <Button title={t("mmap.pickOnMap")} icon="map-pin" variant="line" full onPress={() => setPicking(true)} /> : null}
            <Text variant="caption" tone="gray2">{t("mmap.privacy")}</Text>
          </View>
        ) : null}

        {n.phase === "denied" ? (
          <View style={[s.card, { backgroundColor: c.warnBg, borderColor: c.warnBg }]}>
            <Text variant="body" weight="bold" style={{ color: c.warn }}>{t(n.locError || "mmap.deniedTitle")}</Text>
            <Text variant="small" style={{ color: c.warn }}>{t(showMap ? "mmap.deniedText" : "mmap.deniedNoMap")}</Text>
            <View style={s.row}>
              <Button title={t("mmap.retry")} size="sm" variant="soft" onPress={() => void n.locate()} />
              <Button title={t("mmap.settings")} size="sm" variant="line" onPress={() => void openLocationSettings()} />
            </View>
          </View>
        ) : null}

        {n.origin ? (
          <>
            {n.origin.manual ? <Notice icon="map-pin" text={t("mmap.manualPoint")} /> : null}
            {n.precise === false && !n.origin.manual ? <Notice icon="alert-circle" tone="warn" text={t("mmap.approxPermission")} /> : null}
            {n.lowAccuracy ? <Notice icon="alert-triangle" tone="warn" text={t("mmap.lowAccuracy", { m: Math.round(n.origin.accuracy ?? 0) })} /> : null}
            <View style={s.filters}>
              <ChipBar value={String(f.radius)} onChange={(v) => set({ radius: Number(v) as typeof f.radius })} options={RADII.map((r) => ({ value: String(r), label: t("mmap.radius", { n: r }) }))} />
              <ChipBar value={f.sellerType ?? "all"} onChange={(v) => set({ sellerType: v === "all" ? null : (v as SellerType) })} options={TYPES.map((x) => ({ value: x, label: t(`mmap.type.${x}`) }))} />
              <ChipBar value={f.sort} onChange={(v) => set({ sort: v })} options={SORTS.map((x) => ({ value: x, label: t(`mmap.sort.${x}`) }))} />
            </View>
            <View style={[s.toggle, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
              <Icon name="shield" size={17} color={c.accent} />
              <Text variant="small" weight="semibold" style={s.flex}>{t("mmap.verifiedOnly")}</Text>
              <Toggle value={f.verifiedOnly} onChange={(v) => set({ verifiedOnly: v })} label={t("mmap.verifiedOnly")} />
            </View>
            {n.nearby.data?.fallbackNearest && list.length ? <Notice icon="info" tone="warn" text={t("mmap.fallback", { n: f.radius })} /> : null}

            {n.nearby.isLoading ? (
              <View style={s.gap}>{[0, 1, 2].map((i) => <Skeleton key={i} height={78} round={18} />)}</View>
            ) : n.consentRequired ? (
              <Notice icon="lock" tone="warn" text={t("mmap.err.client_location_consent_required")} />
            ) : n.nearby.isError ? (
              <View style={s.gap}>
                <Notice icon="alert-circle" tone="warn" text={t(mapErrorKey(n.nearby.error))} />
                <Button title={t("mmap.retry")} size="sm" variant="soft" onPress={() => void n.nearby.refetch()} />
              </View>
            ) : !list.length ? (
              <EmptyState compact icon="map-pin" title={t("mmap.empty")} text={t("mmap.emptyText")} />
            ) : (
              <View style={[s.list, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
                {list.map((x, k) => (
                  <Fragment key={x.id}>
                    {k ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
                    <PressableScale onPress={() => setOpen(x)} scale={0.99} accessibilityRole="button" accessibilityLabel={x.name} style={s.item}>
                      <Avatar name={x.name || "?"} uri={x.avatar || undefined} size={46} />
                      <View style={s.flex}>
                        <View style={s.line}>
                          <Text variant="body" weight="bold" numberOfLines={1} style={s.flex}>{x.name}</Text>
                          {x.distanceKm !== null ? <Text variant="small" weight="bold" tone="accent">{t("mmap.km", { n: x.distanceKm.toFixed(1) })}</Text> : null}
                        </View>
                        <View style={s.line}>
                          <Text variant="small" tone="gray" numberOfLines={1} style={s.flex}>{[t(`mmap.type.${x.type}`) === `mmap.type.${x.type}` ? x.type : t(`mmap.type.${x.type}`), x.district || x.region].filter(Boolean).join(" · ")}</Text>
                          {x.rating && x.reviews ? <Text variant="small" weight="semibold">★ {fmtRating(x.rating, locale)}</Text> : <Text variant="caption" tone="gray">{t("mmap.newSeller")}</Text>}
                        </View>
                        {x.verified || x.service ? (
                          <View style={s.line}>
                            {x.verified ? <Pill small tone="ok" icon="check-circle" label={t("mmap.verified")} /> : null}
                            {x.service ? <Text variant="caption" tone="gray" numberOfLines={1} style={s.flex}>{x.service.title}</Text> : null}
                          </View>
                        ) : null}
                      </View>
                    </PressableScale>
                  </Fragment>
                ))}
              </View>
            )}
            <PressableScale onPress={() => void n.revoke()} hitSlop={8} accessibilityRole="button" style={s.revoke}>
              <Icon name="x-circle" size={15} tone="gray" />
              <Text variant="small" weight="semibold" tone="gray">{t("mmap.revoke")}</Text>
            </PressableScale>
          </>
        ) : null}
        {n.viewport.isError && !n.viewport.data ? <Notice icon="wifi-off" tone="warn" text={t(mapErrorKey(n.viewport.error))} /> : null}
      </ScrollView>
      <SellerSheet seller={open} origin={n.origin ? { lat: n.origin.lat, lon: n.origin.lon } : null} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}

function Notice({ icon, text, tone }: { icon: "map" | "info" | "alert-triangle" | "alert-circle" | "map-pin" | "lock" | "wifi-off"; text: string; tone?: "warn" }) {
  const c = useColors();
  const fg = tone === "warn" ? c.warn : c.accentStrong;
  return (
    <View style={[s.notice, { backgroundColor: tone === "warn" ? c.warnBg : c.tint }]}>
      <Icon name={icon} size={16} color={fg} />
      <Text variant="small" style={[s.flex, { color: fg }]}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  body: { padding: 16, gap: 14 },
  mapBox: { height: 300, borderRadius: radius.rl, overflow: "hidden", borderWidth: 1 },
  mapHint: { position: "absolute", top: 10, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  card: { padding: 16, gap: 10, borderRadius: radius.rl, borderWidth: 1 },
  ico: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", gap: 10 },
  filters: { gap: 8, marginHorizontal: -16 },
  toggle: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingLeft: 14, paddingRight: 10, borderRadius: radius.r, borderWidth: 1 },
  gap: { gap: 10 },
  list: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: 76 },
  item: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 12 },
  flex: { flex: 1, minWidth: 0 },
  line: { flexDirection: "row", alignItems: "center", gap: 8 },
  revoke: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 6 },
  notice: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.r },
});
