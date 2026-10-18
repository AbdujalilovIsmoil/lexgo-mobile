import { RowCard, StatusPill } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { Pkg } from "../model/types";

const TINT: Record<string, string> = { on_sale: "#22C55E", under_review: "#F59E0B", approved: "#3B82F6", stopped: "#EF4444" };

// One package: title, price (and the saving against buying the services one by one), parts and status.
export function PkgRow({ item, onPress }: { item: Pkg; onPress: () => void }) {
  const { t } = useT();
  return (
    <RowCard
      icon="package" tint={TINT[item.status] ?? "#06B6D4"} title={item.title}
      subtitle={`${fmtMoney(item.price)} ${t("adm.currency")}${item.savings ? ` · ${t("ag5.saves", { n: fmtMoney(item.savings) })}` : ""}`}
      meta={t("ag5.parts", { c: item.components.length, m: item.milestones.length })} right={<StatusPill status={item.status} />} onPress={onPress}
    />
  );
}
