import { Platform, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { Lawyer } from "../model/types";
import { useGeoLabels } from "../lib/labels";

const TONES: readonly (readonly [string, string])[] = [["#2F5FD8", "#16307A"], ["#7C6CF2", "#4B3BC4"], ["#3BA9C9", "#1E6F8E"], ["#E8763A", "#B8501F"], ["#2E9E6A", "#1B6E48"]];
const toneOf = (name: string) => TONES[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % TONES.length];

type Props = { lawyer: Lawyer; first: boolean; last: boolean; onPress: () => void };

// One specialist as a card of the directory (Adliya): the monogram on a rounded square, the name with the verified check (TOP for a paid
// placement), the type, the stars with the review count, the first practice areas as chips, then a foot — years of experience, the region and
// the "from" price. ("busy" when he is.) `first` / `last` are kept for the list's call; every card is whole.
export function LawyerRow({ lawyer: l, onPress }: Props) {
  const { colors: c, dark, glass } = useTheme();
  const { t } = useT();
  const geo = useGeoLabels();
  const kind = t(l.kind === "advocate" ? "mkw.roles.advokat" : "mkw.roles.yurist");
  const areas = l.specializations.slice(0, 2).map((a) => geo.area(a));
  const card = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" };
  const sep = dark || glass ? c.line : "#E6EBF3";
  return (
    <PressableScale onPress={onPress} scale={0.99} accessibilityRole="button" accessibilityLabel={`${l.name}, ${kind}`} style={[s.card, card, !glass && s.shadow]}>
      <View style={s.top}>
        <Avatar name={l.name} size={76} colors={toneOf(l.name)} square />
        <View style={s.mid}>
          <View style={s.nameRow}>
            <Text variant="h4" weight="bold" numberOfLines={1} style={s.name}>{l.name}</Text>
            {l.verified ? <Ionicons name="checkmark-circle" size={18} color={c.accent} /> : null}
            {l.promoted ? <View style={s.badge}><Text variant="caption" weight="bold" style={s.badgeTx}>{t("mk1.dir.top")}</Text></View> : null}
          </View>
          <Text variant="small" tone="gray" numberOfLines={1}>{kind}{!l.available ? ` · ${t("mk1.dir.busy")}` : ""}</Text>
          <View style={s.rate}>
            <Ionicons name="star" size={15} color="#F5B301" />
            {l.rated && l.reviews > 0 ? (
              <Text variant="small" numberOfLines={1}><Text variant="small" weight="bold" style={{ color: "#B7791F" }}>{l.rating.toFixed(1)}</Text><Text variant="small" tone="gray">{` (${t("lw.reviews", { n: l.reviews })})`}</Text></Text>
            ) : <Text variant="small" tone="gray" numberOfLines={1}>{t("mk1.dir.noRating")}</Text>}
          </View>
          {areas.length ? (
            <View style={s.chips}>
              {areas.map((a) => <View key={a} style={[s.chip, { backgroundColor: dark || glass ? c.surface2 : "#F1F4F9" }]}><Text variant="caption" weight="semibold" numberOfLines={1} style={{ color: c.ink }}>{a}</Text></View>)}
            </View>
          ) : null}
        </View>
      </View>
      <View style={[s.foot, { borderTopColor: sep }]}>
        {l.experienceYears > 0 ? (
          <View style={s.fact}><Icon name="briefcase" size={16} color={c.gray} /><Text variant="caption" tone="gray" numberOfLines={2} style={s.factTx}>{t("mk1.dir.years", { n: l.experienceYears })}</Text></View>
        ) : null}
        {l.region ? (
          <View style={s.fact}><Icon name="map-pin" size={16} color={c.gray} /><Text variant="caption" tone="gray" numberOfLines={2} style={s.factTx}>{geo.region(l.region)}</Text></View>
        ) : <View style={s.fact} />}
        <Text variant="body" weight="bold" numberOfLines={1} style={[s.price, { color: c.ink }]}>{l.basePrice > 0 ? t("mkw.card.priceFrom", { price: fmtMoney(l.basePrice) }) : t("mkw.card.priceAsk")}</Text>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, borderRadius: 20, borderWidth: 1, gap: 12, marginBottom: 12 },
  top: { flexDirection: "row", gap: 14 },
  mid: { flex: 1, minWidth: 0, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { flexShrink: 1, fontSize: 16.5, lineHeight: 22 },
  badge: { backgroundColor: "#FDF1D6", borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  badgeTx: { color: "#A96A00", fontSize: 10 },
  rate: { flexDirection: "row", alignItems: "center", gap: 5 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, maxWidth: "100%" },
  foot: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, borderTopWidth: 1 },
  fact: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1, flexBasis: "28%" },
  factTx: { flexShrink: 1, fontSize: 12, lineHeight: 15 },
  price: { marginLeft: "auto", fontSize: 15 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
