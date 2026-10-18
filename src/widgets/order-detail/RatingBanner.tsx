import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { MarketOrder } from "@/entities/order";
import { Button, Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { mmss } from "@/shared/lib/format";
import { useNow } from "@/shared/lib/pay/useNow";

// The 15-minute rating / complaint window of a finished order. The server decides when it is open (`rating.available`);
// the countdown runs from its `remaining_seconds`, and the server still has the last word when the button is pressed.
export function RatingBanner({ order: o }: { order: MarketOrder }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const r = o.rating;
  const open = !!r && r.available && !o.ratingSubmitted;
  const now = useNow(open);
  if (o.ratingStars) return <Text variant="small" tone="gray">{t("ntd.od.rated", { n: o.ratingStars })}{o.ratingComment ? ` · ${o.ratingComment}` : ""}</Text>;
  if (!r) return null;
  const left = open ? Math.max(0, r.remainingSeconds * 1000 - (now - r.fetchedAt)) : 0;
  if (!open) return r.reason !== "expired" || o.ratingSubmitted ? null : <Text variant="small" tone="gray">{t("ntd.od.rateClosed")}</Text>;
  return (
    <Card tinted style={s.card}>
      <View style={s.head}><Icon name="star" size={18} color={c.warn} /><Text variant="body" weight="bold" style={s.flex}>{t("ntd.od.rateTitle")}</Text><Text variant="body" weight="bold" tone="accent">{mmss(left)}</Text></View>
      <Text variant="caption" tone="gray">{t("ntd.od.rateText")}</Text>
      <Button title={t("mk4.rate")} icon="star" variant="gradient" onPress={() => router.push(`/rate/${o.workId || o.id}` as never)} full />
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 10, padding: 14 }, head: { flexDirection: "row", alignItems: "center", gap: 8 }, flex: { flex: 1 } });
