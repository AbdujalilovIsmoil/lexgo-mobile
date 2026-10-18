import { StyleSheet, View } from "react-native";
import { separatelyPrice, TierCard, type CatalogEntry, type ServicePackage } from "@/entities/package";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";

type Props = { code: string; items: ServicePackage[]; byCode: Map<string, CatalogEntry>; onDetails: (p: ServicePackage) => void; onOrder: (p: ServicePackage) => void };

// One package code: its title and category, then a card per tariff (the middle one marked as the usual pick).
export function PackageGroup({ code, items, byCode, onDetails, onOrder }: Props) {
  const c = useColors();
  return (
    <View style={s.col}>
      <View style={s.head}>
        <Icon name="package" size={18} color={c.accent} />
        <Text variant="h4" style={s.flex} numberOfLines={2}>{items[0].title}</Text>
      </View>
      <Text variant="caption" tone="gray">{[items[0].categoryTitle, code].filter(Boolean).join(" · ")}</Text>
      {items.map((p, i) => (
        <TierCard key={p.id} pkg={p} best={items.length > 1 && i === Math.min(1, items.length - 1)} separately={separatelyPrice(p, byCode)} onDetails={() => onDetails(p)} onOrder={() => onOrder(p)} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
});
