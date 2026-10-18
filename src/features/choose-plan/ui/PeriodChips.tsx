import { View } from "react-native";
import { PERIOD_KEY, type BillingPeriod } from "@/entities/plan";
import { Chip, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { label: string; periods: BillingPeriod[]; value: BillingPeriod; onChange: (p: BillingPeriod) => void };

// Period chips of a request sheet (web: .chiprow of .fchip); `periods` is what the plan sells.
export function PeriodChips({ label, periods, value, onChange }: Props) {
  const { t } = useT();
  return (
    <View style={{ gap: 8 }}>
      <Text variant="small" tone="gray">{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {periods.map((p) => <Chip key={p} label={t(PERIOD_KEY[p])} active={value === p} onPress={() => onChange(p)} />)}
      </View>
    </View>
  );
}
