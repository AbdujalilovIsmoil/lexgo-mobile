import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useRatingWindow, type MarketOrder } from "@/entities/order";
import { Button, Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { mmss } from "@/shared/lib/format";

// The 15-minute rating / complaint window of a finished order. The server decides when it is open (`rating.available`); the countdown
// runs from its `remaining_seconds`, and at 00:00 the banner turns into "closed" while the order is read again (useRatingWindow).
export function RatingBanner({ order: o }: { order: MarketOrder }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const r = o.rating;
  const { open, left } = useRatingWindow(o);
  if (o.ratingStars) return <Text variant="small" tone="gray">{t("ntd.od.rated", { n: o.ratingStars })}{o.ratingComment ? ` · ${o.ratingComment}` : ""}</Text>;
  if (!r) return null;
  if (!open) return (r.reason !== "expired" && left !== 0) || o.ratingSubmitted ? null : <Text variant="small" tone="gray">{t("ntd.od.rateClosed")}</Text>;
  return (
    <Card tinted style={s.card}>
      <View style={s.head}><Icon name="star" size={18} color={c.warn} /><Text variant="body" weight="bold" style={s.flex}>{t("ntd.od.rateTitle")}</Text>{left !== null ? <Text variant="body" weight="bold" tone="accent">{mmss(left)}</Text> : null}</View>
      <Text variant="caption" tone="gray">{t("ntd.od.rateText")}</Text>
      <Button title={t("mk4.rate")} icon="star" variant="gradient" onPress={() => router.push(`/rate/${o.workId || o.id}` as never)} full />
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 10, padding: 14 }, head: { flexDirection: "row", alignItems: "center", gap: 8 }, flex: { flex: 1 } });
