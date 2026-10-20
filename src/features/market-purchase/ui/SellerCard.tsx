import { StyleSheet, View } from "react-native";
import type { PackageSeller } from "@/entities/package";
import { useColors } from "@/shared/theme";
import { Avatar, Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { seller: PackageSeller; onPress: () => void };

// One seller who enabled the package: name, rating, the LexGo verification badge, finished orders; the reasons when not eligible.
export function SellerCard({ seller: x, onPress }: Props) {
  const c = useColors();
  const { t } = useT();
  return (
    <PressableScale onPress={onPress} disabled={!x.eligible} scale={0.98} accessibilityRole="button" style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine, opacity: x.eligible ? 1 : 0.6 }]}>
      <Avatar name={x.name || "A"} size={46} />
      <View style={s.col}>
        <Text variant="body" weight="bold" numberOfLines={2}>{x.name}</Text>
        <View style={s.row}>
          <Icon name="star" size={13} color={c.warn} />
          <Text variant="caption" weight="bold">{x.reviews ? x.rating.toFixed(1) : "—"}</Text>
          <Text variant="caption" tone="gray">· {t("ntd.pk.done", { n: x.completed })}</Text>
          {x.online ? <Pill label={t("ntd.pk.online")} tone="ok" small /> : null}
        </View>
        {x.verified ? <Pill label={x.badge || t("ntd.pk.verified")} tone="ok" icon="shield" small /> : null}
        {x.reasons.map((r) => <Text key={r} variant="caption" tone="err">{r}</Text>)}
      </View>
      <Icon name="chevron-right" size={18} tone="gray" />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, borderWidth: 1.5 },
  col: { flex: 1, gap: 4, alignItems: "flex-start" },
  row: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
});
