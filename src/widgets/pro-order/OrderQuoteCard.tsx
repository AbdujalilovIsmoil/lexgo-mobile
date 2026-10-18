import type { ProOrder } from "@/entities/pro-order";
import { Text } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

// What the client bought (TZ 10): the package snapshot and the selected Studio options with the backend's own amounts.
export function OrderQuoteCard({ order: o }: { order: ProOrder }) {
  const { t } = useT();
  const som = useSom();
  const q = o.quote;
  if (!o.pack && !q.options.length && !q.total) return null;
  const tier = o.pack?.tier ? (t(`mk8.tiers.${o.pack.tier}`).startsWith("mk8.") ? o.pack.tier : t(`mk8.tiers.${o.pack.tier}`)) : undefined;
  return (
    <SectionCard title={t("ntd.sellerV2.ord.bought")}>
      {o.pack ? <FactRows rows={[{ label: t("ntd.sellerV2.ord.package"), value: o.pack.title }, { label: t("ntd.sellerV2.ord.tier"), value: tier }, { label: t("ntd.sellerV2.ord.duration"), value: o.pack.duration }]} /> : null}
      {o.pack?.included.length ? <Text variant="small" tone="gray">{o.pack.included.join(" · ")}</Text> : null}
      <FactRows rows={[
        { label: t("ntd.po.base"), value: q.base ? som(q.base) : undefined },
        ...q.options.map((x) => ({ label: x.label || x.id, value: x.amount ? `+${som(x.amount)}` : "✓" })),
        { label: t("ntd.po.total"), value: q.total ? som(q.total) : undefined },
      ]} />
    </SectionCard>
  );
}
