import { FactRows, SectionCard } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import type { Placement, PromoPackage } from "@/entities/promotion";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

// Package, duration and price (always the server's — the client sends only ids) and how the payment works.
export function SummaryCard({ pkg, placement, target }: { pkg: PromoPackage; placement: Placement; target: string }) {
  const { t } = useT();
  const som = useSom();
  return (
    <SectionCard title={t("sl11.summary")}>
      <FactRows rows={[
        { label: t("sl11.f.placement"), value: t(`sl11.placement.${placement}`) },
        { label: t("sl11.f.target"), value: target },
        { label: t("sl11.f.package"), value: pkg.title },
        { label: t("sl11.f.duration"), value: t("sl11.days", { n: pkg.days }) },
        { label: t("sl11.f.amount"), value: som(pkg.price) },
      ]} />
      <Notice text={t("sl11.payNote")} icon="send" />
    </SectionCard>
  );
}
