import { useState } from "react";
import { emptyDraft, fromPkg, useSavePackage, type Pkg, type PkgDraft } from "@/entities/admin-packages";
import { FormSheet } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { Button, Text } from "@/shared/ui";
import { View } from "react-native";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { packageSchema, structureReady, textsOf } from "../model/packageSchema";
import { useServiceNames } from "../model/useServiceNames";
import { ComponentCard } from "./ComponentCard";
import { MilestonesSection } from "./MilestonesSection";
import { ServicePicker } from "./ServicePicker";
import { SimulationCard } from "./SimulationCard";

type Props = { visible: boolean; pkg: Pkg | null; onClose: () => void };

// Create or edit a package (draft / stopped ones): services with prices, package price with the live simulator, milestones, terms.
export function PackageFormSheet({ visible, pkg, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(packageSchema, textsOf(pkg));
  const [struct, setStruct] = useState<Pick<PkgDraft, "components" | "milestones">>(emptyDraft());
  const d: PkgDraft = { ...f.watch(), ...struct };
  const [pick, setPick] = useState(false);
  const names = useServiceNames();
  useSheetReset(visible, () => { f.reset(textsOf(pkg)); setStruct(pkg ? fromPkg(pkg) : emptyDraft()); });
  const save = useSavePackage();
  const set = <K extends "components" | "milestones">(k: K, v: PkgDraft[K]) => setStruct((x) => ({ ...x, [k]: v }));
  const submit = f.handleSubmit((v) => save.mutate({ id: pkg?.id, draft: { ...v, ...struct } }, { onSuccess: onClose }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={pkg ? t("ag5.edit") : t("ag5.create")} subtitle={t("ag5.formHint")} onSubmit={() => void submit()} submitting={save.isPending} disabled={!structureReady(d)} snaps={[0.85, 0.96]}>
      <FormInput control={f.control} name="title" label={t("adm.title")} />
      <View style={{ gap: 10 }}>
        <Text variant="h4">{t("ag5.components")}</Text>
        {d.components.map((c, i) => (
          <ComponentCard key={`${c.serviceId}-${i}`} c={c} name={names.byId.get(c.serviceId)?.name ?? "—"} onChange={(n) => set("components", d.components.map((x, j) => (j === i ? n : x)))} onRemove={() => set("components", d.components.filter((_, j) => j !== i))} />
        ))}
        <Button title={t("ag5.addService")} icon="plus" variant="soft" onPress={() => setPick(true)} />
      </View>
      <FormInput control={f.control} name="price" label={t("ag5.packagePrice")} format={(v) => v.replace(/\D/g, "")} keyboardType="number-pad" hint={t("ag5.priceHint")} />
      <SimulationCard draft={d} />
      <MilestonesSection draft={d} onChange={(m) => set("milestones", m)} />
      <FormInput control={f.control} name="included" label={t("ag5.included")} multiline hint={t("ag5.linesHint")} />
      <FormInput control={f.control} name="excluded" label={t("ag5.excluded")} multiline hint={t("ag5.linesHint")} />
      <FormInput control={f.control} name="refund" label={t("ag5.refund")} multiline />
      <ServicePicker visible={pick} onClose={() => setPick(false)} services={names.all} loading={names.loading} onPick={(s) => set("components", [...d.components, { serviceId: s.id, clientPrice: s.price ?? 0, sellerFee: 0, kind: "mandatory", quantity: 1, unit: "service" }])} />
    </FormSheet>
  );
}
