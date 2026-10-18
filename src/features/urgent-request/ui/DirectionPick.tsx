import { DIRECTIONS } from "@/entities/urgent";
import { Field, MultiChips } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { StepCard } from "./StepCard";

type Props = { value: string[]; onChange: (v: string[]) => void; error: boolean };

// Practice areas the advocate is matched on (at least one) — the first question of the order.
export function DirectionPick({ value, onChange, error }: Props) {
  const { t } = useT();
  return (
    <StepCard n={1} title={t("ug2.directions")} done={value.length > 0}>
      <Field hint={t("ug2.directionsHint")} error={error ? t("ug2.missDirection") : undefined}>
        <MultiChips options={DIRECTIONS.map((d) => ({ value: d, label: t(`ug4.dir.${d}`) }))} value={value} onChange={onChange} />
      </Field>
    </StepCard>
  );
}
