import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import type { PromoSurface } from "@/entities/lawyer";
import { openUrl } from "@/shared/lib/links";
import { PromoCard } from "./PromoCard";

type Props = { items: PromoSurface[]; onOpenSeller: (userId: string) => void };

// Banners and boosted profiles/services the backend sends with the list, one full-width "Top" card at a time (swipe for the next). A tap
// opens the specialist's drawer; only an absolute https link leaves the app.
export function PromoRail({ items, onOpenSeller }: Props) {
  const { width } = useWindowDimensions();
  const w = width - 32;
  const seen = new Set<string>(); // one card per seller+service even if he runs a banner and a boost
  const list = items.filter((p) => { const k = `${p.sellerUserId || p.id}-${p.serviceId}`; return !seen.has(k) && (seen.add(k), true); });
  if (!list.length) return null;
  const open = (p: PromoSurface) => {
    if (p.sellerUserId) onOpenSeller(p.sellerUserId);
    else if (/^https:\/\//i.test(p.ctaUrl)) openUrl(p.ctaUrl);
  };
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={w + 12} snapToAlignment="start" style={s.rail} contentContainerStyle={s.row} keyboardShouldPersistTaps="handled">
      {list.slice(0, 6).map((p) => <View key={p.id || `${p.sellerUserId}-${p.serviceId}`} style={{ width: w }}><PromoCard item={p} onPress={() => open(p)} /></View>)}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  rail: { flexGrow: 0, marginBottom: 12 },
  row: { gap: 12, paddingHorizontal: 16 },
});
