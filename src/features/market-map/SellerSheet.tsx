import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { isNavUnavailable, mapErrorKey, NAV_MODES, openNavigation, requestNavigation, type MapSeller, type NavMode } from "@/entities/market-map";
import { useT } from "@/shared/i18n";
import { fmtRating } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { radius, useColors } from "@/shared/theme";
import { Avatar, BottomSheet, Button, Icon, Pill, Text, toast } from "@/shared/ui";
import { ChipBar } from "@/shared/ui/admin";

// A specialist tapped on the map or in the list: who they are (type, verification, rating, distance — the place is approximate, never an
// address), their service with its price, the public profile, and a route. The route is always asked from the backend
// (POST …/navigation) and opened in Yandex Navigator / Yandex Maps, or the web fallback — never built from the marker's coordinate.
export function SellerSheet({ seller, origin, onClose }: { seller: MapSeller | null; origin: { lat: number; lon: number } | null; onClose: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const router = useRouter();
  const [mode, setMode] = useState<NavMode>("driving");
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState<Record<string, string>>({});
  const s = seller;
  const go = (to: string) => { onClose(); setTimeout(() => router.push(to as never), 180); };
  const route = async () => {
    if (!s || !origin || busy) return;
    setBusy(true);
    try {
      const nav = await requestNavigation(s.id, { latitude: origin.lat, longitude: origin.lon, mode });
      await openNavigation(nav, mode);
    } catch (e) {
      if (isNavUnavailable(e)) setBlocked((b) => ({ ...b, [s.id]: mapErrorKey(e) }));
      else toast(t(e instanceof Error && e.message === "navigation_unavailable" ? "mmap.err.noNavApp" : mapErrorKey(e)), "err");
    } finally {
      setBusy(false);
    }
  };
  const navOff = !!s && (s.navigable === false || !!blocked[s.id]);
  const type = s ? t(`mmap.type.${s.type}`) === `mmap.type.${s.type}` ? s.type : t(`mmap.type.${s.type}`) : "";
  return (
    <BottomSheet visible={!!s} onClose={onClose} title={s?.name || t("mmap.specialist")} subtitle={type} snaps={[0.66, 0.92]}>
      {s ? (
        <View style={st.body}>
          <View style={st.head}>
            <Avatar name={s.name || "?"} uri={s.avatar || undefined} size={56} />
            <View style={st.flex}>
              <View style={st.chips}>
                {s.verified ? <Pill small tone="ok" icon="check-circle" label={t("mmap.verified")} /> : null}
                {s.rating && s.reviews ? <Pill small tone="warn" icon="star" label={`${fmtRating(s.rating, locale)} · ${t("mmap.reviews", { n: s.reviews })}`} /> : <Pill small tone="gray" label={t("mmap.newSeller")} />}
              </View>
              <Text variant="small" tone="gray" numberOfLines={2}>{[s.distanceKm !== null ? t("mmap.km", { n: s.distanceKm.toFixed(1) }) : "", s.district || s.region].filter(Boolean).join(" · ")}</Text>
            </View>
          </View>
          <View style={[st.note, { backgroundColor: c.surface2 }]}>
            <Icon name="map-pin" size={15} tone="gray" />
            <Text variant="caption" tone="gray" style={st.flex}>{t("mmap.approximate")}</Text>
          </View>
          {s.service ? (
            <View style={[st.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
              <Text variant="caption" weight="bold" tone="gray">{t("mmap.service").toUpperCase()}</Text>
              <Text variant="body" weight="bold" numberOfLines={2}>{s.service.title}</Text>
              {s.service.price ? <Text variant="h4" tone="accent">{`${fmtMoney(s.service.price)} ${t("common.currency")}`}</Text> : null}
              <Button title={t("mmap.openService")} icon="arrow-right" iconRight size="sm" variant="soft" onPress={() => go(`/specialist/${encodeURIComponent(s.id)}?tab=services`)} />
            </View>
          ) : null}
          <Button title={t("mmap.profile")} icon="user" variant="line" full onPress={() => go(`/specialist/${encodeURIComponent(s.id)}`)} />
          <View style={st.gap}>
            <Text variant="caption" weight="bold" tone="gray">{t("mmap.route").toUpperCase()}</Text>
            <View style={st.modes}><ChipBar value={mode} onChange={setMode} options={NAV_MODES.map((m) => ({ value: m, label: t(`mmap.mode.${m}`) }))} /></View>
            {navOff ? (
              <View style={[st.note, { backgroundColor: c.warnBg }]}>
                <Icon name="info" size={15} color={c.warn} />
                <Text variant="caption" style={[st.flex, { color: c.warn }]}>{t(blocked[s.id] ?? "mmap.err.navigation_destination_unavailable")}</Text>
              </View>
            ) : null}
            <Button title={origin ? t("mmap.go") : t("mmap.needLocation")} icon="navigation" variant="gradient" full loading={busy} disabled={navOff || !origin} onPress={() => void route()} />
          </View>
        </View>
      ) : null}
    </BottomSheet>
  );
}

const st = StyleSheet.create({
  body: { paddingHorizontal: 18, paddingBottom: 28, gap: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 14 },
  flex: { flex: 1, minWidth: 0 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  note: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: radius.r },
  card: { gap: 6, padding: 14, borderRadius: radius.rl, borderWidth: 1 },
  gap: { gap: 10 },
  modes: { marginHorizontal: -18 },
});
