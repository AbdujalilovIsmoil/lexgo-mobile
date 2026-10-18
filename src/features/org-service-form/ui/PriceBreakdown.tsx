import { FactRows } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { percents, recommended, type PriceBand } from "@/entities/organization";

// "How the price came out": catalog price, the coefficients that apply to this member, the range.
export function PriceBreakdown({ band }: { band: PriceBand }) {
  const { t } = useT();
  const som = (n: number) => `${fmtMoney(n)} ${t("adm.currency")}`;
  const p = percents(band);
  const mods = band.modifiers.filter((m) => m.amount !== 0);
  return (
    <FactRows rows={[
      { label: t("og6.base"), value: band.base ? som(band.base) : "" },
      ...mods.map((m) => ({ label: t(`og6.mod.${m.code}`) === `og6.mod.${m.code}` ? m.code : t(`og6.mod.${m.code}`), value: `${m.amount > 0 ? "+" : "−"}${som(Math.abs(m.amount))}` })),
      { label: t("og6.recommended"), value: som(recommended(band)) },
      { label: p ? t("og6.rangeOf", { lo: p.lo, hi: p.hi }) : t("og6.range"), value: `${fmtMoney(band.min)} – ${som(band.max)}` },
    ]} />
  );
}
