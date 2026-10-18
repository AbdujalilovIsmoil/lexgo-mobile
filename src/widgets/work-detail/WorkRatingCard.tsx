import { StyleSheet, View } from "react-native";
import type { WorkRating } from "@/entities/work";
import { useRatingClock, useWorkNav } from "@/features/work-actions";
import { useColors } from "@/shared/theme";
import { Button, Icon, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDateTime, mmss } from "@/shared/lib/format";

type Props = { rating: WorkRating; workId: string; fetchedAt: number; onExpire: () => void };

// The 15-minute rating/complaint window (TZ 25). Everything here comes from the server's
// `rating` block: open (with a countdown seeded by the server), rated, or closed.
export function WorkRatingCard({ rating, workId, fetchedAt, onExpire }: Props) {
  const c = useColors();
  const { t, locale } = useT();
  const nav = useWorkNav();
  const left = useRatingClock(rating, fetchedAt, onExpire);
  const open = rating.available && !rating.submitted && rating.remainingSeconds > 0;
  const expired = !open && !rating.submitted && (rating.available || /expire|passed|closed|timeout/.test(rating.closedReason));
  if (!open && !rating.submitted && !expired) return null;
  return (
    <SectionCard title={t("cl5.rating.title")}>
      {open ? (
        <>
          <View style={s.row}>
            <Icon name="clock" size={18} color={c.warn} />
            <Text variant="small" tone="warn" weight="bold">{t("cl5.rating.left", { time: mmss(left * 1000) })}</Text>
          </View>
          <Text variant="small" tone="gray">{t("cl5.rating.hint")}</Text>
          <Button title={t("cl5.rating.cta")} icon="star" variant="gradient" size="sm" onPress={() => nav.rate(workId)} />
        </>
      ) : rating.submitted ? (
        <>
          <Text style={[s.stars, { color: c.warn }]}>{"★".repeat(rating.stars)}<Text style={[s.stars, { color: c.line }]}>{"★".repeat(Math.max(0, 5 - rating.stars))}</Text></Text>
          {rating.comment ? <Text variant="small" tone="gray">{rating.comment}</Text> : null}
          {rating.ratedAt ? <Text variant="caption" tone="gray2">{t("cl5.rating.rated", { date: fmtDateTime(rating.ratedAt, locale) })}</Text> : null}
        </>
      ) : (
        <View style={s.row}>
          <Icon name="lock" size={16} tone="gray" />
          <Text variant="small" tone="gray" style={s.flex}>{t("cl5.rating.closed")}</Text>
        </View>
      )}
    </SectionCard>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  stars: { fontSize: 24, letterSpacing: 2 },
});
