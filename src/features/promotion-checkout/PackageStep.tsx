import { StyleSheet, View } from "react-native";
import type { PromoPackage } from "@/entities/promotion";
import { popularId } from "@/entities/promotion";
import { radius, useColors } from "@/shared/theme";
import { EmptyState, ErrorView, Icon, PressableScale, Skeleton, Text } from "@/shared/ui";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

type Props = { packages: PromoPackage[]; loading: boolean; error: unknown; onRetry: () => void; value: string; onChange: (id: string) => void };

// Step 2 — the admin-priced packages as big tiles: the price is the hero number, days and reach are small facts under it,
// the popular package wears a ribbon and is pre-selected, the chosen tile is outlined and ticked.
export function PackageStep({ packages, loading, error, onRetry, value, onChange }: Props) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  const popular = popularId(packages);
  return (
    <View style={s.list}>
      <Text variant="h4" accessibilityRole="header">{t("promoSeller.ck.step2")}</Text>
      {loading ? [0, 1, 2].map((i) => <Skeleton key={i} height={104} round={18} />) : null}
      {!loading && error ? <ErrorView error={error} onRetry={onRetry} compact /> : null}
      {!loading && !error && !packages.length ? <EmptyState compact icon="package" title={t("promoSeller.ck.empty")} text={t("promoSeller.ck.emptyText")} /> : null}
      <View accessibilityRole="radiogroup" accessibilityLabel={t("promoSeller.ck.packages")} style={s.list}>
        {packages.map((p) => {
          const on = (value || popular) === p.id;
          const facts = [t("promoSeller.ck.days", { d: p.days }), p.reach ? t("promoSeller.ck.reach", { x: p.reach }) : ""].filter(Boolean).join(" · ");
          return (
            <PressableScale
              key={p.id}
              onPress={() => onChange(p.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${p.title}. ${som(p.price)}. ${facts}${p.id === popular ? `. ${t("promoSeller.ck.popular")}` : ""}`}
              style={[s.tile, { borderColor: on ? c.accent : c.line, backgroundColor: on ? c.tint : c.surface }]}
            >
              {p.id === popular ? <View style={[s.ribbon, { backgroundColor: c.accent }]}><Text variant="caption" weight="bold" style={{ color: "#FFFFFF" }}>{t("promoSeller.ck.popular")}</Text></View> : null}
              <View style={s.top}>
                <Text variant="small" tone="gray" numberOfLines={2} style={s.fill}>{p.title}</Text>
                <Icon name={on ? "check-circle" : "circle"} size={24} color={on ? c.accent : c.gray2} />
              </View>
              <Text variant="hx" numberOfLines={1} adjustsFontSizeToFit>{som(p.price)}</Text>
              <Text variant="small" tone="gray">{facts}</Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  list: { gap: 12 },
  tile: { borderRadius: radius.rl, borderWidth: 2, padding: 16, gap: 4, minHeight: 104, overflow: "hidden" },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  fill: { flex: 1 },
  ribbon: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, marginBottom: 4 },
});
