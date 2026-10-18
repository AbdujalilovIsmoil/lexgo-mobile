import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import type { Lawyer } from "@/entities/lawyer";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";

function Stars({ value }: { value: number }) {
  const c = useColors();
  return <View style={s.stars}>{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" size={12} color={i <= Math.round(value) ? c.warn : c.line} />)}</View>;
}

// Client reviews with the specialist's replies; an empty state before the first one.
export function ReviewsList({ lawyer, bare }: { lawyer: Lawyer; bare?: boolean }) {
  const c = useColors();
  const { t, locale } = useT();
  return (
    <View style={s.col}>
      {bare ? null : <Text variant="h4">{t("mk2.reviews")}</Text>}
      {lawyer.reviewList.length ? lawyer.reviewList.map((r, i) => (
        <View key={r.id || i} style={[s.item, { borderColor: c.line }]}>
          <View style={s.head}>
            <Text variant="small" weight="bold" style={s.flex} numberOfLines={1}>{r.author || t("mk2.anonymous")}</Text>
            <Stars value={r.rating} />
          </View>
          {r.createdAt ? <Text variant="caption" tone="gray2">{fmtDate(r.createdAt, locale)}</Text> : null}
          {r.comment ? <Text variant="small">{r.comment}</Text> : null}
          {r.reply ? <View style={[s.reply, { backgroundColor: c.tint }]}><Text variant="caption" tone="gray" weight="bold">{t("mk2.sellerReply")}</Text><Text variant="small">{r.reply}</Text></View> : null}
        </View>
      )) : <Text variant="small" tone="gray2">{t("mk2.noReviews")}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  item: { borderWidth: 1, borderRadius: 16, padding: 13, gap: 5 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  stars: { flexDirection: "row", gap: 2 },
  reply: { borderRadius: 12, padding: 10, gap: 2 },
});
