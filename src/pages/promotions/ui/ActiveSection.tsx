import { StyleSheet, View } from "react-native";
import { progressOf, type Placement, type Running } from "@/entities/promotion";
import { radius, shadows, useColors } from "@/shared/theme";
import { Icon, Pill, Text, type IconName } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

const NAME = { banner: "placementBanner", profile_boost: "placementProfile", service_boost: "placementService" } as const;
const ICON: Record<Placement, IconName> = { banner: "image", profile_boost: "user-check", service_boost: "briefcase" };

// «Faol targ'ib»: one green card per running promotion — where, what, which package, a progress bar from start to end,
// days left, the end date and the price paid. The server refuses a second request for a spot that is still running, so there is no
// "extend" button: the card says it can be renewed once it ends.
export function ActiveSection({ items }: { items: Running[] }) {
  const { t, locale } = useT();
  const c = useColors();
  const som = useSom();
  if (!items.length) return null;
  return (
    <View style={s.list}>
      <Text variant="h4" accessibilityRole="header">{t("promoSeller.ck.liveTitle")}</Text>
      {items.map((r) => {
        const what = r.placement === "service_boost" ? r.serviceTitle || t(`promoSeller.${NAME[r.placement]}`) : t("promoSeller.ck.liveProfile");
        const left = t("promoSeller.ck.liveLeft", { d: r.daysLeft });
        const until = r.endsAt ? t("promoSeller.ck.liveUntil", { date: fmtDate(r.endsAt, locale) }) : "";
        return (
          <View key={r.id || `${r.placement}-${r.serviceId}`} style={[s.card, shadows.s1, { backgroundColor: c.okBg, borderColor: c.ok }]}>
            <View style={s.head}>
              <Icon name={ICON[r.placement]} size={18} color={c.ok} />
              <Text variant="small" weight="bold" style={[s.fill, { color: c.ok }]} numberOfLines={1}>{t(`promoSeller.${NAME[r.placement]}`)}</Text>
              <Pill label={left} tone="ok" small />
            </View>
            <Text variant="h4" numberOfLines={2}>{what}</Text>
            <Text variant="small" tone="gray" numberOfLines={1}>{r.packageTitle}</Text>
            <View accessible accessibilityRole="progressbar" accessibilityLabel={`${left}. ${until}`} accessibilityValue={{ min: 0, max: 100, now: Math.round(progressOf(r.startsAt, r.endsAt) * 100) }} style={[s.track, { backgroundColor: c.surface }]}>
              <View style={[s.fillBar, { width: `${Math.max(4, Math.round(progressOf(r.startsAt, r.endsAt) * 100))}%`, backgroundColor: c.ok }]} />
            </View>
            <View style={s.foot}>
              <View style={s.fill}>
                {until ? <Text variant="caption" tone="gray">{until}</Text> : null}
                <Text variant="caption" tone="gray2">{t("promoSeller.ck.renewLater")}</Text>
                {r.price > 0 ? <Text variant="caption" tone="gray">{`${t("promoSeller.ck.livePaid")}: ${som(r.price)}`}</Text> : null}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  list: { gap: 12 },
  card: { borderRadius: radius.rl, borderWidth: 1.5, padding: 14, gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  fill: { flex: 1 },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fillBar: { height: 8, borderRadius: 4 },
  foot: { flexDirection: "row", alignItems: "center", gap: 10 },
  extend: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1.5 },
});
