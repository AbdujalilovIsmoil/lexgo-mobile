import { StyleSheet, View } from "react-native";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { Lawyer } from "../model/types";
import { useGeoLabels } from "../lib/labels";

const TONES: readonly (readonly [string, string])[] = [["#2F5FD8", "#16307A"], ["#7C6CF2", "#4B3BC4"], ["#3BA9C9", "#1E6F8E"], ["#E8763A", "#B8501F"], ["#2E9E6A", "#1B6E48"]];
const toneOf = (name: string) => TONES[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % TONES.length];

type Props = { lawyer: Lawyer; first: boolean; last: boolean; onPress: () => void };

// One specialist as a row of the directory's card: monogram, the name with the verified shield (and TOP for a paid placement), what and
// where (type · main practice area · region), the track record (rating and reviews, years, success; "busy" when he is) and the "from" price.
// `first` / `last` round the card's corners and close its edges.
export function LawyerRow({ lawyer: l, first, last, onPress }: Props) {
  const c = useColors();
  const { t } = useT();
  const geo = useGeoLabels();
  const kind = t(l.kind === "advocate" ? "mkw.roles.advokat" : "mkw.roles.yurist");
  const area = l.specializations[0] ? geo.area(l.specializations[0]) : "";
  const what = [kind, area, l.region ? geo.region(l.region) : ""].filter(Boolean).join(" · ");
  const record = [
    l.rated && l.reviews > 0 ? `★ ${l.rating.toFixed(1)} (${l.reviews})` : t("mk1.dir.noRating"),
    l.experienceYears > 0 ? t("mk1.dir.years", { n: l.experienceYears }) : "",
    l.successRate > 0 ? t("mk1.dir.success", { n: Math.round(l.successRate) }) : "",
  ].filter(Boolean).join(" · ");
  const card = c.surface;
  return (
    <PressableScale onPress={onPress} scale={0.99} accessibilityRole="button" accessibilityLabel={l.name}
      style={[s.row, { backgroundColor: card, borderColor: c.line }, first && s.first, last && s.last, !last && { borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Avatar name={l.name} size={50} colors={toneOf(l.name)} />
      <View style={s.mid}>
        <View style={s.nameRow}>
          <Text variant="h4" numberOfLines={1} style={s.name}>{l.name}</Text>
          {l.verified ? <Icon name="shield" size={14} color={c.accent} /> : null}
          {l.promoted ? <View style={s.top}><Text variant="caption" weight="bold" style={s.topTx}>{t("mk1.dir.top")}</Text></View> : null}
        </View>
        <Text variant="small" tone="gray" numberOfLines={1}>{what}</Text>
        <View style={s.foot}>
          <Text variant="caption" tone="gray" numberOfLines={1} style={s.flex}>{record}</Text>
          {!l.available ? <Text variant="caption" weight="semibold" tone="warn">{t("mk1.dir.busy")}</Text> : null}
        </View>
        <Text variant="small" weight="bold" numberOfLines={1} style={{ color: c.accent }}>{l.basePrice > 0 ? t("mkw.card.priceFrom", { price: fmtMoney(l.basePrice) }) : t("mkw.card.priceAsk")}</Text>
      </View>
      <Icon name="chevron-right" size={18} tone="gray" />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderLeftWidth: 1, borderRightWidth: 1 },
  first: { borderTopWidth: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  last: { borderBottomWidth: 1, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  mid: { flex: 1, minWidth: 0, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { flexShrink: 1, fontSize: 16 },
  top: { backgroundColor: "#FDF1D6", borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  topTx: { color: "#A96A00", fontSize: 10 },
  foot: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1, minWidth: 0 },
});
