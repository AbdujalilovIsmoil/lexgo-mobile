import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Pill, Text, type PillTone } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import type { Gift } from "../types";
import { tOr } from "@/shared/lib/pay/tOr";

const TONE: Record<string, PillTone> = { claimed: "ok", activated: "ok", paid: "ok", unclaimed: "cy", sent: "cy", pending: "warn", unpaid: "warn", expired: "err", cancelled: "err", canceled: "err" };
export const GIFT_TILE = 48;

// One gift, sent or received, as a flat row (hairlines divide the rows): a tile whose colour says the direction (sent = blue,
// received = green), the title, kind · who · term, the date and the status pill.
export function GiftRowCard({ item, onPress }: { item: Gift; onPress: () => void }) {
  const c = useColors();
  const { t, locale } = useT();
  const incoming = item.direction === "received";
  const tint = incoming ? c.ok : c.accent;
  return (
    <PressableScale onPress={onPress} style={s.row}>
      <View style={[s.tile, { backgroundColor: `${tint}24` }]}><Icon name={incoming ? "download" : "gift"} size={22} color={tint} /></View>
      <View style={s.body}>
        <Text variant="body" weight="bold" numberOfLines={1}>{item.title || t("py8.untitled")}</Text>
        <Text variant="caption" tone="gray" numberOfLines={1}>{[t(item.isService ? "py8.kindService" : "py8.kindPlan"), incoming ? t("py8.incoming") : item.recipientPhone, item.termMonths ? t("py8.months", { n: item.termMonths }) : ""].filter(Boolean).join(" · ")}</Text>
        <Text variant="caption" tone="gray2" numberOfLines={1}>{[item.workId, fmtDate(item.createdAt, locale)].filter(Boolean).join(" · ")}</Text>
      </View>
      <Pill label={tOr(t, "py8.status", item.status)} tone={TONE[item.status] ?? "gray"} small />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  tile: { width: GIFT_TILE, height: GIFT_TILE, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 2 },
});
