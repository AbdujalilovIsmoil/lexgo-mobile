import { View } from "react-native";
import { useReconciliation } from "@/entities/admin-payouts";
import { BarList, QueryBoundary, SectionCard } from "@/shared/ui/admin";
import { CcHero } from "@/shared/ui/cc";
import { fmtCompact, fmtMoney } from "@/shared/lib/money";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Platform money flow: gross, seller share and paid payments as the hero; one bar splits the gross into seller / platform / provider.
export function ReconciliationCards() {
  const { t } = useT();
  const c = useColors();
  const q = useReconciliation();
  const r = q.data;
  const seg = (key: string, value: number | undefined, color: string, pct?: string) => ({ key, value: value ?? 0, color, label: `${t(`admPay.${key}`)}${pct ? ` ${pct}` : ""} · ${fmtCompact(value ?? 0)}` });
  return (
    <QueryBoundary query={q}>
      <View style={{ gap: 12, paddingBottom: 12 }}>
        <CcHero
          stats={[
            { value: fmtCompact(r?.gross ?? 0), label: t("admPay.gross") },
            { value: fmtCompact(r?.sellerShare ?? 0), label: t("admPay.sellerShare"), color: c.ok },
            { value: `${r?.paidCount ?? 0}/${r?.paymentsCount ?? 0}`, label: t("admPay.paidCount") },
          ]}
          segments={[seg("sellerShare", r?.sellerShare, c.ok), seg("platformFee", r?.platformFee, "#8B5CF6", "18%"), seg("providerFee", r?.providerFee, c.warn, "1%")]}
        />
        {r?.providers.length ? (
          <SectionCard title={t("admPay.byProvider")}>
            <BarList items={r.providers.slice(0, 5).map((p) => ({ label: p.provider, value: p.amount, hint: `${p.count}` }))} format={fmtMoney} />
          </SectionCard>
        ) : null}
      </View>
    </QueryBoundary>
  );
}
