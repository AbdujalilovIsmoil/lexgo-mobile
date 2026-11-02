import { Fragment, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, View } from "react-native";
import { geocodeReverse, geocodeSearch, geoLang, isGeocoderDown, mapErrorKey, useDeleteOffice, useMapConfig, useOffice, usePutOffice, type GeoItem } from "@/entities/market-map";
import { useT } from "@/shared/i18n";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useInsets } from "@/shared/lib/insets";
import { radius, useColors } from "@/shared/theme";
import { Button, confirmDialog, ErrorView, Icon, Input, PressableScale, Skeleton, Text, Toggle } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { YandexMap, type YandexMapHandle } from "@/widgets/yandex-map/YandexMap";

// /pro/office — the professional's office (GET / PUT / DELETE /marketplace/me/office-location): a point chosen on the map or by an address
// search, the address filled by the reverse geocoder (or typed by hand when it is unavailable), and the switch that lets clients get a
// route to it — turned on only after a clear confirmation. It is independent of the temporary live-location sharing.
export function OfficePage() {
  const { t, locale } = useT();
  const c = useColors();
  const insets = useInsets();
  const cfg = useMapConfig().data;
  const q = useOffice();
  const put = usePutOffice();
  const del = useDeleteOffice();
  const map = useRef<YandexMapHandle>(null);
  const [point, setPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [address, setAddress] = useState("");
  const [pub, setPub] = useState(false);
  const [geoDown, setGeoDown] = useState(false);
  const [mapDown, setMapDown] = useState(false);
  const [search, setSearch] = useState("");
  const needle = useDebounced(search, 450).trim();
  const lang = geoLang(locale);
  // The saved office fills the form once, when it arrives (a later refetch never overwrites what is being edited).
  const [seeded, setSeeded] = useState(false);
  if (q.data && !seeded) {
    setSeeded(true);
    setPoint({ lat: q.data.lat, lon: q.data.lon });
    setAddress(q.data.address);
    setPub(q.data.publicNavigation);
  }
  const geo = useQuery({ queryKey: ["market-map", "geocode", needle, lang], queryFn: () => geocodeSearch(needle, lang), enabled: needle.length >= 3, retry: false, staleTime: 60_000 });
  const hits: GeoItem[] = needle.length >= 3 && search.trim() ? geo.data ?? [] : [];
  const searchDown = geo.isError && isGeocoderDown(geo.error);

  const choose = (p: { lat: number; lon: number }, known?: string) => {
    setPoint(p);
    if (known) return setAddress(known);
    geocodeReverse(p.lat, p.lon, lang).then((r) => { if (r[0]?.address) setAddress(r[0].address); }).catch((e) => { if (isGeocoderDown(e)) setGeoDown(true); });
  };

  const togglePub = (v: boolean) => {
    if (!v) return setPub(false);
    confirmDialog({ title: t("mmap.office.confirmTitle"), message: t("mmap.office.confirmText"), confirmLabel: t("mmap.office.confirmYes"), cancelLabel: t("adm.cancel"), icon: "navigation", onConfirm: () => setPub(true) });
  };
  const save = () => point && put.mutate({ lat: point.lat, lon: point.lon, address: address.trim(), publicNavigation: pub });
  const remove = () => confirmDialog({ title: t("mmap.office.removeTitle"), message: t("mmap.office.removeText"), confirmLabel: t("mmap.office.remove"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: () => del.mutate(undefined, { onSuccess: () => { setPoint(null); setAddress(""); setPub(false); } }) });
  const canSave = !!point && address.trim().length >= 3;

  return (
    <AdminPage title={t("mmap.office.title")} subtitle={t("mmap.office.subtitle")} footer={<Button title={t("mmap.office.save")} variant="gradient" size="lg" full loading={put.isPending} disabled={!canSave} onPress={save} />}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 24 }]}>
        {q.isLoading ? <Skeleton height={260} round={22} /> : q.isError && !(q.error && mapErrorKey(q.error) === "mmap.err.notFound") ? <ErrorView error={q.error} onRetry={() => void q.refetch()} compact /> : null}
        {cfg?.configured && !mapDown ? (
          <View style={[s.map, { borderColor: c.glassLine }]}>
            <YandexMap ref={map} config={cfg} height={260} points={[]} pick pickPoint={point} onPick={(p) => choose(p)} onError={() => setMapDown(true)} />
            <View style={[s.hint, { backgroundColor: c.bg }]}><Icon name="crosshair" size={14} color={c.accent} /><Text variant="caption" weight="semibold">{t("mmap.office.tap")}</Text></View>
          </View>
        ) : cfg ? <Text variant="small" tone="gray">{t("mmap.mapDown")}</Text> : <Skeleton height={260} round={22} />}

        <Input label={t("mmap.office.search")} value={search} onChangeText={setSearch} placeholder={t("mmap.office.searchPh")} left={<Icon name="search" size={17} tone="gray" />} />
        {hits.length ? (
          <View style={[s.list, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
            {hits.map((h, i) => (
              <Fragment key={h.id}>
                {i ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
                <PressableScale onPress={() => { setSearch(""); choose({ lat: h.lat, lon: h.lon }, h.address); map.current?.center(h.lon, h.lat, 16); }} scale={0.99} accessibilityRole="button" style={s.hit}>
                  <Icon name="map-pin" size={16} color={c.accent} />
                  <View style={s.flex}><Text variant="small" weight="bold" numberOfLines={1}>{h.name}</Text><Text variant="caption" tone="gray" numberOfLines={1}>{h.address}</Text></View>
                </PressableScale>
              </Fragment>
            ))}
          </View>
        ) : null}

        <Input label={`${t("mmap.office.address")} *`} value={address} onChangeText={setAddress} placeholder={t("mmap.office.addressPh")} multiline style={s.area} />
        {geoDown || searchDown ? <Text variant="caption" tone="gray">{t(searchDown ? mapErrorKey(geo.error) : "mmap.office.geoDown")}</Text> : null}

        <View style={[s.toggle, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
          <Icon name="navigation" size={18} color={c.accent} />
          <View style={s.flex}>
            <Text variant="small" weight="bold">{t("mmap.office.public")}</Text>
            <Text variant="caption" tone="gray">{t("mmap.office.publicSub")}</Text>
          </View>
          <Toggle value={pub} onChange={togglePub} label={t("mmap.office.public")} />
        </View>
        <View style={[s.note, { backgroundColor: c.tint }]}>
          <Icon name="shield" size={16} color={c.accentStrong} />
          <Text variant="caption" style={[s.flex, { color: c.accentStrong }]}>{t("mmap.office.privacy")}</Text>
        </View>
        {q.data ? <Button title={t("mmap.office.remove")} icon="trash-2" variant="line" full loading={del.isPending} onPress={remove} /> : null}
      </ScrollView>
    </AdminPage>
  );
}

const s = StyleSheet.create({
  body: { padding: 16, gap: 14 },
  map: { height: 260, borderRadius: radius.rl, overflow: "hidden", borderWidth: 1 },
  hint: { position: "absolute", top: 10, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  list: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: 44 },
  hit: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  flex: { flex: 1, minWidth: 0 },
  area: { minHeight: 70, textAlignVertical: "top" },
  toggle: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.rl, borderWidth: 1 },
  note: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.r },
});
