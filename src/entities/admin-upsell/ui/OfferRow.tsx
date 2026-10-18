import { RowCard, StatusPill } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { Offer } from "../model/types";

// One offer: its title, who it is for and the price; the backend status as a pill.
export function OfferRow({ item, who, onPress }: { item: Offer; who: string; onPress: () => void }) {
  const { t, locale } = useT();
  return (
    <RowCard
      icon="trending-up" tint="#F59E0B" title={item.title} subtitle={[who, item.price ? `${fmtMoney(item.price)} ${t("adm.currency")}` : ""].filter(Boolean).join(" · ")}
      meta={[item.validUntil ? t("ag6.offer.until", { d: fmtDate(item.validUntil, locale) }) : "", t("ag6.offer.redeemed", { n: item.redemptions })].filter(Boolean).join(" · ")}
      right={<StatusPill status={item.status} />} onPress={onPress}
    />
  );
}
