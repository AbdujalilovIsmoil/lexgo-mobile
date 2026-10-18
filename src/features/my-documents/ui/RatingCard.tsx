import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ratePath, type DocRating } from "@/entities/my-document";
import { useCountdown } from "../model/useCountdown";

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
type Props = { rating: DocRating; workId: string; onRate: () => void };

// Rating window of a finished document: open (server says so) / given / closed. Null when none.
export function RatingCard({ rating, workId, onRate }: Props) {
  const { t } = useT();
  const router = useRouter();
  const c = useColors();
  const left = useCountdown(rating.remainingSeconds, rating.deadlineAt);
  const open = rating.available && !rating.submitted;
  const hadWindow = !!rating.deadlineAt || rating.closedReason === "expired";
  if (!open && !rating.submitted && !hadWindow) return null;
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Icon name="star" size={18} color="#F59E0B" />
        <Text variant="h4" style={{ flex: 1 }}>{rating.submitted ? t("dm6.rated") : open ? t("dm6.rateTitle") : t("dm6.rateClosed")}</Text>
        {open && left !== null ? <Text variant="small" weight="bold" style={{ color: left < 120 ? c.err : c.gray }}>{t("dm6.left", { time: clock(left) })}</Text> : null}
      </View>
      {rating.submitted ? (
        <View style={s.head}>
          {[1, 2, 3, 4, 5].map((n) => <Icon key={n} name="star" size={22} color={n <= rating.value ? "#F59E0B" : c.line} />)}
          {rating.comment ? <Text variant="small" tone="gray" numberOfLines={2} style={{ flex: 1, marginLeft: 6 }}>{rating.comment}</Text> : null}
        </View>
      ) : null}
      {open ? <Button title={t("dm6.rateAction")} icon="star" full onPress={onRate} /> : null}
      {workId && (open || rating.submitted) ? (
        <PressableScale onPress={() => router.push(ratePath(workId) as never)} hitSlop={8} style={{ alignSelf: "flex-start" }}>
          <Text variant="small" weight="bold" tone="accent">{t("dm6.complain")}</Text>
        </PressableScale>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 12 }, head: { flexDirection: "row", alignItems: "center", gap: 8 } });
