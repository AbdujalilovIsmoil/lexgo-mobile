import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Card, Icon, Pill, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Outcome = { title: string; text: string; price?: string; unit?: string };
const ICONS: { icon: IconName; key: "err" | "warn" | "ok" }[] = [{ icon: "alert-triangle", key: "err" }, { icon: "alert-octagon", key: "warn" }, { icon: "check-circle", key: "ok" }];

// What a review returns: errors, risks and ready-made suggestions.
export function ReviewOutcomes() {
  const c = useColors();
  const { tList } = useT();
  return (
    <View style={s.col}>
      {tList<Outcome>("modes.review.cards").map((o, i) => {
        const { icon, key } = ICONS[i % ICONS.length];
        return (
          <Card key={i} style={s.card}>
            <View style={[s.badge, { backgroundColor: c[`${key}Bg` as "errBg"] }]}><Icon name={icon} size={20} color={c[key]} /></View>
            <View style={s.copy}>
              <Text variant="h4">{o.title}</Text>
              <Text variant="small" tone="gray">{o.text}</Text>
              {o.price ? <Pill label={`${o.price} ${o.unit ?? ""}`.trim()} tone="ok" small /> : null}
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  card: { flexDirection: "row", gap: 12, padding: 14 },
  badge: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: 6, alignItems: "flex-start" },
});
