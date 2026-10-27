import { StyleSheet } from "react-native";
import { hasEnded, type PromoSurface } from "@/entities/lawyer";
import { openUrl } from "@/shared/lib/links";
import { Carousel } from "@/shared/ui";
import { PromoCard } from "./PromoCard";

type Props = { items: PromoSurface[]; onOpenSeller: (userId: string) => void };

// The marketplace's top banners, one full-width card at a time (swipe for the next). A banner whose end date has passed (a copy kept
// on the phone) is left out. A tap opens the specialist's page; only an absolute https link leaves the app.
export function PromoRail({ items, onOpenSeller }: Props) {
  const seen = new Set<string>(); // one card per seller+service
  const list = items.filter((p) => { const k = `${p.sellerUserId || p.id}-${p.serviceId}`; return !hasEnded(p.endsAt) && !seen.has(k) && (seen.add(k), true); });
  if (!list.length) return null;
  const open = (p: PromoSurface) => {
    if (p.sellerUserId) onOpenSeller(p.sellerUserId);
    else if (/^https:\/\//i.test(p.ctaUrl)) openUrl(p.ctaUrl);
  };
  return (
    <Carousel
      items={list.slice(0, 6)}
      keyOf={(p) => p.id || `${p.sellerUserId}-${p.serviceId}`}
      cardWidth={(rail) => rail - 32}
      style={s.rail}
      renderItem={(p) => <PromoCard item={p} onPress={() => open(p)} />}
    />
  );
}

const s = StyleSheet.create({
  rail: { flexGrow: 0, marginBottom: 12 },
});
