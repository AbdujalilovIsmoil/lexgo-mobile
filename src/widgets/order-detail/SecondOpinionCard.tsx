import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import type { MarketOrder } from "@/entities/order";
import { trackPromo, useHidePromotion, usePromotion, usePromotionSync } from "@/entities/second-opinion";
import { SecondOpinionSheet } from "@/features/second-opinion";
import { Button, Card, Icon, IconButton, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { order: MarketOrder; tick: number }; // tick: bumps while the page scrolls, so "is the card on screen" is asked again

// "Ikkinchi fikr — advokatlar guruhi" on a paid marketplace order, in progress and after completion. Rendered only when the order carries
// the promotion link and the backend says `visible`; the texts are the backend's and there is no price on the card, ever. The impression is
// sent once, when at least half of the card is on screen; a tap sends `click` and opens the selection sheet; the close sends `dismiss`.
export function SecondOpinionCard({ order, tick }: Props) {
  const { t } = useT();
  const c = useColors();
  const fromEvent = usePromotionSync(order.id);
  const url = order.secondOpinionUrl || fromEvent; // the order's link; the realtime event's until the order has it
  const q = usePromotion(order.id, url);
  const hide = useHidePromotion(order.id);
  const [open, setOpen] = useState(false);
  const ref = useRef<View>(null);
  const p = q.data;
  const shown = !!url && !!p?.visible;

  const check = useCallback(() => {
    if (!p || !shown) return;
    ref.current?.measureInWindow((_x, y, _w, h) => {
      if (h <= 0) return;
      const H = Dimensions.get("window").height;
      if (Math.min(y + h, H) - Math.max(y, 0) >= h * 0.5) void trackPromo(p, "impression");
    });
  }, [p, shown]);
  useEffect(() => {
    const id = setTimeout(check, 350);
    return () => clearTimeout(id);
  }, [check, tick]);

  if (!p || !shown) return null;
  const cta = p.ctaLabel || t("so1.sheetTitle");
  return (
    <View ref={ref} collapsable={false}>
      <Card style={[s.card, { borderColor: c.accent }]}>
        <View style={s.head}>
          <View style={[s.tile, { backgroundColor: c.tint2 }]}><Icon name="users" size={20} tone="accent" /></View>
          <Text variant="h4" style={s.title}>{p.title}</Text>
          {p.dismissible ? (
            <IconButton icon="x" size={32} label={t("so1.dismiss")} onPress={() => { hide(); void trackPromo(p, "dismiss"); }} />
          ) : null}
        </View>
        {p.description ? <Text variant="small" tone="gray">{p.description}</Text> : null}
        {p.benefits.map((b) => (
          <View key={b} style={s.benefit}>
            <Icon name="check" size={16} tone="accent" />
            <Text variant="small" style={s.title}>{b}</Text>
          </View>
        ))}
        <Button title={cta} icon="users" variant="gradient" full onPress={() => { void trackPromo(p, "click"); setOpen(true); }} />
      </Card>
      <SecondOpinionSheet visible={open} onClose={() => setOpen(false)} order={order} promo={p} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 14, borderWidth: 1.5, borderRadius: radius.rl },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  tile: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  title: { flex: 1 },
  benefit: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
});
