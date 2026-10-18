import { CATEGORIES, CUSTOM, useRegLabels } from "@/entities/admin-aireg";
import { SelectField } from "@/shared/ui/admin";
import { Input } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// A category from the presets, or "custom" with its own name.
export function CategoryField({ choice, custom, error, onChoice, onCustom }: { choice: string; custom: string; error?: string; onChoice: (v: string) => void; onCustom: (v: string) => void }) {
  const { t } = useT();
  const l = useRegLabels();
  return (
    <>
      <SelectField label={t("admAiRegB.category")} value={choice} error={choice === CUSTOM ? undefined : error} options={[...CATEGORIES.map((c) => ({ value: c, label: l.cat(c) })), { value: CUSTOM, label: t("admAiReg.cat.custom") }]} onChange={onChoice} />
      {choice === CUSTOM ? <Input label={t("admAiRegB.customCategory")} value={custom} onChangeText={onCustom} placeholder={t("admAiRegB.customPh")} autoCapitalize="none" error={error} /> : null}
    </>
  );
}
