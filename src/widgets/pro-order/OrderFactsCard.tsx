import type { ProOrder } from "@/entities/pro-order";
import { Text } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Order facts: ID, payment, how the buyer wants to talk, their note.
export function OrderFactsCard({ order: o }: { order: ProOrder }) {
  const { t, locale } = useT();
  const channel = o.preferredChannel ? (t(`sl12.channel.${o.preferredChannel}`).startsWith("sl9.") ? o.preferredChannel : t(`sl12.channel.${o.preferredChannel}`)) : undefined;
  return (
    <SectionCard title={t("sl9.details")}>
      <FactRows rows={[
        { label: t("sl9.f.id"), value: o.workId },
        { label: t("sl9.f.payment"), value: o.paymentStatus ? (t(`admSt.${o.paymentStatus}`).startsWith("admSt.") ? humanizeSlug(o.paymentStatus) : t(`admSt.${o.paymentStatus}`)) : undefined },
        { label: t("sl9.f.channel"), value: channel },
        { label: t("sl9.f.time"), value: o.preferredTime },
        { label: t("sl9.f.created"), value: fmtDateTime(o.createdAt, locale) },
        { label: t("sl9.f.updated"), value: o.updatedAt !== o.createdAt ? fmtDateTime(o.updatedAt, locale) : undefined },
      ]} />
      {o.note ? <><Text variant="caption" tone="gray">{t("sl9.clientNote")}</Text><Text variant="small">{o.note}</Text></> : null}
    </SectionCard>
  );
}
