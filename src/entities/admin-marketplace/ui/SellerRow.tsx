import { View } from "react-native";
import { Pill, Text } from "@/shared/ui";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { useMktLabels } from "../lib/useLabels";
import type { MktSeller } from "../model/detailTypes";

// One seller: identity, type · region, rating, verification and the order counters.
export function SellerRow({ item: s, onPress }: { item: MktSeller; onPress?: () => void }) {
  const { t, locale } = useT();
  const label = useMktLabels();
  const place = [s.region, s.district && s.district.toLowerCase() !== s.region.toLowerCase() ? s.district : ""].filter(Boolean).map(humanizeSlug).join(", ");
  const ver = s.isVerified ? "verified" : s.verificationStatus === "rejected" || s.verificationStatus === "pending" ? s.verificationStatus : "none";
  return (
    <RowCard
      avatar={s.name || s.phone || "?"}
      title={s.name || s.phone || "—"}
      subtitle={[label.type(s.sellerType), place].filter(Boolean).join(" · ")}
      meta={[s.lexgoId, s.phone].filter(Boolean).join(" · ")}
      onPress={s.ordersTotal > 0 ? onPress : undefined}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        <Pill small tone={s.isVerified ? "ok" : ver === "pending" ? "warn" : ver === "rejected" ? "err" : "gray"} label={t(`admMkt.verify.${ver}`)} />
        {s.rating > 0 ? <Pill small tone="warn" icon="star" label={`${s.rating.toFixed(1)} (${s.reviewsCount})`} /> : null}
        {s.accountStatus && s.accountStatus !== "active" ? <StatusPill status={s.accountStatus} /> : null}
      </View>
      <Text variant="caption" tone="gray">
        {t("admMkt.sellerStats", { active: s.activeOrders, done: s.completedOrders, pending: s.pendingPaymentOrders, total: s.ordersTotal })} · {fmtMoney(s.revenuePaid)} {t("adm.currency")}
      </Text>
      <Text variant="caption" tone="gray2">{s.lastOrderAt ? t("admMkt.lastOrder", { date: fmtDate(s.lastOrderAt, locale) }) : t("admMkt.never")}</Text>
    </RowCard>
  );
}
