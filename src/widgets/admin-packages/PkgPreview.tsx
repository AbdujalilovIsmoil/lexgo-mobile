import { usePackagePreview } from "@/entities/admin-packages";
import { FactRows, QueryBoundary, SectionCard } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { asArr, asDict, asStr, uzs } from "@/shared/lib/json";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// What the client and the seller will see (POST …/preview): prices, what is included / excluded, the seller's fee and the milestones.
export function PkgPreview({ id }: { id: string }) {
  const { t } = useT();
  const q = usePackagePreview(id);
  const c = asDict(q.data?.client);
  const p = asDict(q.data?.provider);
  const som = (n: number) => `${fmtMoney(n)} ${t("adm.currency")}`;
  const list = (v: unknown) => asArr(v).map((x) => `• ${asStr(x)}`).join("\n");
  return (
    <QueryBoundary query={q}>
      <SectionCard title={t("ag5.previewClient")}>
        <FactRows rows={[{ label: t("ag5.sim.separate"), value: som(uzs(c, "separate_price")) }, { label: t("ag5.sim.price"), value: som(uzs(c, "package_price")) }, { label: t("ag5.sim.savings"), value: som(uzs(c, "savings")) }]} />
        {asArr(c.included).length ? <Text variant="small">{t("ag5.included")}{"\n"}{list(c.included)}</Text> : null}
        {asArr(c.excluded).length ? <Text variant="small" tone="gray">{t("ag5.excluded")}{"\n"}{list(c.excluded)}</Text> : null}
      </SectionCard>
      <SectionCard title={t("ag5.previewSeller")}>
        <FactRows rows={[{ label: t("ag5.sim.seller"), value: som(uzs(p, "seller_fee_total")) }, { label: t("ag5.sim.lexgo"), value: som(uzs(p, "lexgo_share")) }]} />
        {asArr(p.milestones).map((m, i) => <Text key={i} variant="small">{asDict(m).index as number}. {asStr(asDict(m).title)} — {asStr(asDict(m).percent)}%</Text>)}
      </SectionCard>
    </QueryBoundary>
  );
}
