import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { PlacementArt, placementState, type PendingPromo, type Placement, type Running } from "@/entities/promotion";
import { radius, shadows, useColors } from "@/shared/theme";
import { Icon, Pill, PressableScale, Skeleton, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

const ORDER = [["banner", "placementBanner"], ["profile_boost", "placementProfile"], ["service_boost", "placementService"]] as const;

type Props = { running: Running[]; pending: PendingPromo[]; loading: boolean };

// «Reklama turini tanlang»: three tall cards, each one a button that opens the checkout for that placement.
// An idle card shows a grey pill and a chevron; a waiting one an amber pill; a running one turns green with «Faol · yana N kun»
// and is not tappable (the server does not take a second request for a running spot).
export function PlacementList({ running, pending, loading }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const router = useRouter();
  const go = (p: Placement) => router.push({ pathname: "/pro/promotions/new", params: { placement: p } });
  return (
    <View style={s.list}>
      <Text variant="h4" accessibilityRole="header">{t("promoSeller.placesTitle")}</Text>
      {ORDER.map(([p, key]) => {
        const st = placementState(p, running, pending);
        const status = st.kind === "active" ? t("promoSeller.placeActive", { days: st.daysLeft }) : t(st.kind === "pending" ? "promoSeller.placePending" : "promoSeller.placeOff");
        const name = t(`promoSeller.${key}`);
        const live = st.kind === "active";
        const ends = live ? running.filter((r) => r.placement === p).map((r) => r.endsAt).sort().pop() : "";
        return (
          <PressableScale
            key={p}
            onPress={() => go(p)}
            disabled={live}
            accessibilityRole="button"
            accessibilityLabel={`${t("promoSeller.ck.openPlacement", { name })}. ${loading ? "" : status}`}
            style={[s.card, shadows.s1, { backgroundColor: live ? c.okBg : c.surface, borderColor: live ? c.ok : c.line }]}
          >
            <PlacementArt kind={p} tall />
            <View style={s.row}>
              <View style={s.fill}>
                <Text variant="h4">{name}</Text>
                <Text variant="small" tone="gray" numberOfLines={3}>{live && ends ? t("promoSeller.ck.liveUntil", { date: fmtDate(ends, locale) }) : t(`promoSeller.${key}Hint`)}</Text>
              </View>
              {live ? null : <Icon name="chevron-right" size={22} color={c.gray2} />}
            </View>
            {loading ? <Skeleton height={24} width={120} round={12} /> : <View style={s.status}><Pill label={status} tone={live ? "ok" : st.kind === "pending" ? "warn" : "gray"} /></View>}
          </PressableScale>
        );
      })}
      <Text variant="caption" tone="gray">{t("promoSeller.boostNote")}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  list: { gap: 12 },
  card: { borderRadius: radius.rl, borderWidth: 1, padding: 14, gap: 12, minHeight: 44 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  fill: { flex: 1, gap: 2 },
  status: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  extend: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1.5 },
});
