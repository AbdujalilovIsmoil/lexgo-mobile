import { StyleSheet, View } from "react-native";
import { Stars, type RateTarget, type ReviewRow } from "@/entities/rating";
import { useCountdown } from "@/features/rating";
import { StatusPill } from "@/shared/ui/admin";
import { Avatar, Button, Pill, PressableScale, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// A work waiting for its rating: who, what, the live countdown when a 15-minute window is open, and a "Baholash" button.
// Both the row and the button open the rating sheet.
export function PendingRow({ target: x, onRate }: { target: RateTarget; onRate: (x: RateTarget) => void }) {
  const { t } = useT();
  const cd = useCountdown(x.kind === "review" ? null : x.window);
  if (x.kind !== "review" && !cd.open) return null;
  return (
    <PressableScale onPress={() => onRate(x)} style={s.row}>
      <Avatar name={x.lawyerName || "?"} size={46} />
      <View style={s.body}>
        <Text variant="body" weight="bold" numberOfLines={1}>{x.lawyerName || t("rtx.noName")}</Text>
        <Text variant="caption" tone="gray" numberOfLines={1}>{x.title || x.workId}</Text>
        {x.kind !== "review" ? <Pill label={t("py10.rate.left", { time: cd.label })} tone={cd.left < 120000 ? "warn" : "cy"} icon="clock" small live /> : null}
      </View>
      <Button title={t("rtx.rate")} size="sm" icon="star" onPress={() => onRate(x)} />
    </PressableScale>
  );
}

// One rating already given: who, the comment, the date, the stars and the moderation state.
export function GivenRow({ r }: { r: ReviewRow }) {
  const { t, locale } = useT();
  return (
    <View style={s.row}>
      <Avatar name={r.lawyerName || "?"} size={46} />
      <View style={s.body}>
        <Text variant="body" weight="bold" numberOfLines={1}>{r.lawyerName || t("rtx.noName")}</Text>
        {r.comment ? <Text variant="caption" tone="gray" numberOfLines={2}>{r.comment}</Text> : null}
        <Text variant="caption" tone="gray2">{fmtDate(r.createdAt, locale)}</Text>
      </View>
      <View style={s.right}><Stars value={r.stars} size={14} /><StatusPill status={r.status} /></View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  body: { flex: 1, gap: 3, alignItems: "flex-start" },
  right: { alignItems: "flex-end", gap: 6 },
});
