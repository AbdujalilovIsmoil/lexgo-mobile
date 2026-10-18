import { useCreatePlan, useSavePlan, type Plan } from "@/entities/admin-plans";
import { FormSheet } from "@/shared/ui/admin";
import { useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { seedVals, toBody } from "../model/planForm";
import { planSchema } from "../model/planSchema";
import { PlanFields } from "./PlanFields";

// Create (plan = null) or edit one tariff. A fresh form per open comes from the caller's `key`.
export function PlanFormSheet({ plan, visible, onClose }: { plan: Plan | null; visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(planSchema, seedVals(plan ?? undefined));
  const create = useCreatePlan();
  const save = useSavePlan();
  const submit = f.handleSubmit((v) => {
    const body = toBody(v, plan ?? undefined);
    if (plan) save.mutate({ plan, body }, { onSuccess: onClose });
    else create.mutate(body, { onSuccess: onClose });
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={plan ? t("admPlans.editTitle") : t("admPlans.create")} subtitle={plan?.slug} onSubmit={() => void submit()} submitLabel={plan ? t("adm.save") : t("adm.create")} submitting={create.isPending || save.isPending} snaps={[0.85, 0.96]}>
      <PlanFields f={f} />
    </FormSheet>
  );
}
