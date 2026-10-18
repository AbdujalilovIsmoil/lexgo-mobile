import { UNIT_TYPES, type Unit, UnitSelect, unitTypeLabel } from "@/entities/admin-hrm";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { unitSchema } from "../model/peopleSchemas";
import { useSaveUnit } from "../model/usePeopleActions";

type Props = { visible: boolean; onClose: () => void; unit: Unit | null; parentId?: string };

// Add a unit (under `parentId`) or edit one: name, code, type, parent and status.
export function UnitForm({ visible, onClose, unit, parentId = "" }: Props) {
  const { t } = useT();
  const f = useAppForm(unitSchema, { name: unit?.name ?? "", code: unit?.code ?? "", type: unit?.type ?? "department", parent: unit ? unit.parentId : parentId, status: unit?.status ?? "active" });
  const save = useSaveUnit();
  const [type, parent, status] = f.watch(["type", "parent", "status"]);
  const submit = f.handleSubmit((v) => save.mutate({ base: unit, input: { name: v.name, code: v.code, type: v.type, parentId: v.parent, status: v.status } }, { onSuccess: () => { onClose(); if (!unit) f.reset(); } }));
  const types = [...new Set([...UNIT_TYPES, type])].map((x) => ({ value: x as string, label: unitTypeLabel(t, x) }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t(unit ? "admHrmB.editUnit" : "admHrmB.newUnit")} onSubmit={() => void submit()} submitting={save.isPending}>
      <FormInput control={f.control} name="name" label={t("adm.name")} autoCapitalize="sentences" />
      <FormInput control={f.control} name="code" label={t("admHrmB.code")} format={(x) => x.toUpperCase()} autoCapitalize="characters" autoCorrect={false} />
      <SelectField label={t("admHrmB.unitKind")} value={type} onChange={(x) => f.setValue("type", x)} options={types} />
      <UnitSelect label={t("admHrmB.parent")} value={parent} onChange={(x) => f.setValue("parent", x)} none={t("admHrmB.noParent")} skip={unit?.id} />
      <SelectField label={t("adm.status")} value={status} onChange={(x) => f.setValue("status", x)} options={[{ value: "active", label: t("adm.active") }, { value: "inactive", label: t("adm.inactive") }]} />
    </FormSheet>
  );
}
