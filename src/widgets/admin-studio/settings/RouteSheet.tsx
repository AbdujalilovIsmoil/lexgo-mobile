import { useState } from "react";
import { View } from "react-native";
import { Button, Card, Input, Segmented, Text } from "@/shared/ui";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { STUDIO_ROLES, saveRoute, studioKeys, useStudioText, type StudioRoute, type StudioRouteStep } from "@/entities/admin-studio";
import { RowTools, moveItem } from "@/features/admin-studio";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useT } from "@/shared/i18n";
import { routeSchema } from "./routeSchema";

const ROLES = [...STUDIO_ROLES, "admin"];
const DEFAULT: StudioRouteStep[] = [{ role: "studio_reviewer", title: "" }, { role: "studio_publisher", title: "" }];
export type RouteTarget = { route: StudioRoute | null; code: string };
type Props = { target: RouteTarget | null; codes: { value: string; label: string }[]; taken: string[]; onClose: () => void };

// Approval route of one constructor: title, status and the ordered steps (role + title).
export function RouteSheet({ target, codes, taken, onClose }: Props) {
  const { t } = useT();
  const { role } = useStudioText();
  const tr = useFieldError();
  const f = useAppForm(routeSchema, { code: "", title: "", status: "active" });
  const { code, status } = f.watch();
  const [steps, setSteps] = useState<StudioRouteStep[]>(DEFAULT);
  const [seen, setSeen] = useState<RouteTarget | null>(null);
  if (seen !== target) {
    setSeen(target);
    if (target) {
      f.reset({ code: target.route?.code ?? target.code, title: target.route?.title ?? "", status: target.route?.status === "active" || !target.route ? "active" : "archived" });
      setSteps(target.route?.steps.length ? target.route.steps : DEFAULT);
    }
  }
  const save = useAdminMutation({ mutationFn: saveRoute, invalidate: [[...studioKeys.all, "routes"]], success: "admStudioC.routes.saved", onSuccess: onClose });
  const patch = (i: number, p: Partial<StudioRouteStep>) => setSteps((cur) => cur.map((s, j) => (j === i ? { ...s, ...p } : s)));
  const submit = f.handleSubmit((v) => save.mutate({ code: v.code, title: v.title, status: v.status, steps: steps.map((s) => ({ role: s.role, title: s.title.trim() || role(s.role) })) }));
  return (
    <FormSheet visible={!!target} onClose={onClose} title={t(target?.route ? "admStudioC.routes.editTitle" : "admStudioC.routes.newTitle")} onSubmit={() => void submit()} submitting={save.isPending} snaps={[0.85, 0.95]}>
      {target?.route ? <Text variant="body" weight="bold">{codes.find((c) => c.value === code)?.label ?? code}</Text> : <SelectField label={`${t("admStudioC.routes.constructor")} *`} value={code} options={codes} onChange={(x) => f.setValue("code", x, { shouldValidate: true })} error={tr(f.formState.errors.code?.message)} searchable />}
      {!target?.route && code && taken.includes(code) ? <Text variant="caption" tone="warn">{t("admStudioC.routes.replaces")}</Text> : null}
      <FormInput control={f.control} name="title" label={`${t("admStudioC.routes.routeTitle")} *`} placeholder={t("admStudioC.routes.titlePh")} maxLength={120} />
      <Segmented value={status} onChange={(x) => f.setValue("status", x)} options={[{ value: "active", label: t("admStudioC.routes.status_active") }, { value: "archived", label: t("admStudioC.routes.status_inactive") }]} />
      <Text variant="small" tone="gray">{t("admStudioC.routes.stepsHint")}</Text>
      {steps.map((s, i) => (
        <Card key={i} style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="small" weight="bold" tone="gray">{t("admStudioC.routes.stepN", { n: i + 1 })}</Text>
            <RowTools index={i} count={steps.length} onMove={(d) => setSteps(moveItem(steps, i, d))} onRemove={() => steps.length > 1 && setSteps(steps.filter((_, j) => j !== i))} />
          </View>
          <SelectField label={t("admStudioC.routes.stepRole")} value={s.role} options={ROLES.map((r) => ({ value: r, label: role(r) }))} onChange={(v) => patch(i, { role: v })} />
          <Input label={t("admStudioC.routes.stepTitle")} value={s.title} onChangeText={(v) => patch(i, { title: v })} placeholder={role(s.role)} maxLength={80} />
        </Card>
      ))}
      {steps.length < 6 ? <Button title={t("admStudioC.routes.addStep")} icon="plus" variant="soft" size="sm" onPress={() => setSteps([...steps, { role: ROLES.find((r) => !steps.some((s) => s.role === r)) ?? "studio_reviewer", title: "" }])} /> : null}
    </FormSheet>
  );
}
