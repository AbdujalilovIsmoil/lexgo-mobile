import { REGION_KEYS } from "@/entities/lawyer";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, FormPhoneInput } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { useOrgForm } from "../model/useOrgForm";

type Props = { visible: boolean; onClose: () => void; onCreated: (id: string) => void };

// "New organization": name, phone, STIR, region, address. The caller becomes the owner.
export function OrgFormSheet({ visible, onClose, onCreated }: Props) {
  const { t } = useT();
  const f = useOrgForm((id) => {
    onCreated(id);
    onClose();
  });
  useSheetReset(visible, f.reset);
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("og1.create")} subtitle={t("og1.createHint")} onSubmit={f.submit} submitLabel={t("adm.create")} submitting={f.busy}>
      <FormInput control={f.f.control} name="name" label={t("og1.name")} maxLength={255} autoCapitalize="words" returnKeyType="next" />
      <FormPhoneInput control={f.f.control} name="phone" label={t("adm.phone")} />
      <FormInput control={f.f.control} name="inn" label={t("og1.inn")} keyboardType="number-pad" maxLength={20} />
      <SelectField label={t("og1.region")} value={f.f.watch("region")} onChange={(x) => f.f.setValue("region", x)} options={REGION_KEYS.map((k) => ({ value: k as string, label: t(`lawyers.regions.${k}`) }))} />
      <FormInput control={f.f.control} name="address" label={t("og1.address")} multiline style={{ minHeight: 70 }} />
    </FormSheet>
  );
}
