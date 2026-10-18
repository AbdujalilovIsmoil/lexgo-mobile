import type { Offer } from "@/entities/admin-upsell";
import { usePlans } from "@/entities/admin-plans";
import { FactRows, FormSheet, StatusPill } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

// One offer (read only: the API has no update): client, price, plan, reason, validity and how often it was bought.
export function OfferSheet({ item, who, onClose }: { item: Offer | null; who: string; onClose: () => void }) {
  const { t, locale } = useT();
  const o = useKept(item);
  const plan = usePlans().data?.plans.find((p) => p.id === o?.planId)?.name ?? "";
  return (
    <FormSheet visible={!!item} onClose={onClose} title={o?.title ?? ""} subtitle={o?.workId}>
      {o ? (
        <>
          <FactRows rows={[
            { label: t("adm.status"), value: <StatusPill status={o.status} /> }, { label: t("ag6.offer.client"), value: who }, { label: t("adm.price"), value: o.price ? `${fmtMoney(o.price)} ${t("adm.currency")}` : "" },
            { label: t("ag6.offer.plan"), value: plan }, { label: t("ag6.offer.validUntil"), value: fmtDateTime(o.validUntil, locale) },
            { label: t("ag6.offer.redeemedLabel"), value: String(o.redemptions) }, { label: t("adm.created"), value: fmtDateTime(o.createdAt, locale) },
          ]} />
          {o.reason ? <Text variant="body">{o.reason}</Text> : null}
        </>
      ) : null}
    </FormSheet>
  );
}
