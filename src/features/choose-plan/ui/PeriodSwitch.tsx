import { Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { PERIODS, PERIOD_KEY, type BillingPeriod } from "@/entities/plan";

// 1 oy / 6 oy / 12 oy (/ oldindan) toggle; `periods` narrows it to what the plans sell.
export function PeriodSwitch({ value, onChange, periods = PERIODS }: { value: BillingPeriod; onChange: (p: BillingPeriod) => void; periods?: BillingPeriod[] }) {
  const { t } = useT();
  return <Segmented variant="solid" value={value} onChange={onChange} options={periods.map((p) => ({ value: p, label: t(PERIOD_KEY[p]) }))} />;
}
