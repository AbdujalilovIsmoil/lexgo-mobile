import { additionalOpen, hms, msUntil, type ProOrder } from "@/entities/pro-order";
import { Text } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useNow } from "@/shared/lib/pay/useNow";
import { fmtDateTime } from "@/shared/lib/format";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

// Supplemental payment (TZ 11): the order waits for payment, work is paused, the request lives 24 h (backend deadline).
export function AdditionalCard({ order: o }: { order: ProOrder }) {
  const { t, locale } = useT();
  const som = useSom();
  const a = o.additional;
  const open = additionalOpen(a) || o.status === "waiting_payment";
  const left = msUntil(a?.expiresAt ?? "", useNow(open && !!a?.expiresAt));
  if (!a && !open) return null;
  const escalated = a?.status === "escalated";
  return (
    <SectionCard title={t("ntd.sellerV2.add.cardTitle")}>
      {open ? <Notice tone={escalated ? "err" : "warn"} text={t(escalated ? "ntd.sellerV2.add.escalated" : "ntd.sellerV2.add.paused")} /> : null}
      {a ? (
        <FactRows rows={[
          { label: t("ntd.sellerV2.add.status"), value: t(`ntd.sellerV2.add.st.${a.status}`).startsWith("ntd.") ? a.status : t(`ntd.sellerV2.add.st.${a.status}`) },
          { label: t("ntd.sellerV2.add.newTotal"), value: a.total ? som(a.total) : undefined },
          { label: t("ntd.sellerV2.add.left"), value: open && left > 0 ? hms(left) : undefined },
          { label: t("ntd.sellerV2.add.until"), value: a.expiresAt ? fmtDateTime(a.expiresAt, locale) : undefined },
        ]} />
      ) : null}
      {a?.note ? <Text variant="small" tone="gray">{a.note}</Text> : null}
    </SectionCard>
  );
}
