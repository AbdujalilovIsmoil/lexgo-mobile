import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useT } from "@/shared/i18n";
import { createPlan, deletePlan, listPlans, resetPlan, restorePlan, updatePlan } from "../api/planApi";
import type { Plan, PlanInput } from "./types";

export const planKeys = { all: ["admin-plans"] as const };
const inv = [planKeys.all];
type Ref = Pick<Plan, "id" | "slug">;

export function usePlans() {
  const { locale } = useT();
  return useQuery({ queryKey: [...planKeys.all, "list", locale], queryFn: () => listPlans(locale) });
}
export const useCreatePlan = () => useAdminMutation({ mutationFn: (b: PlanInput) => createPlan(b), invalidate: inv, success: "admPlans.created" });
export const useSavePlan = (success = "admPlans.saved") => useAdminMutation({ mutationFn: (v: { plan: Ref; body: PlanInput }) => updatePlan(v.plan, v.body), invalidate: inv, success });
export const useDeletePlan = () => useAdminMutation({ mutationFn: (p: Ref) => deletePlan(p), invalidate: inv, success: "admPlans.deleted" });
export const useRestorePlan = () => useAdminMutation({ mutationFn: (slug: string) => restorePlan(slug), invalidate: inv, success: "admPlans.restored" });
export const useResetPlan = () => useAdminMutation({ mutationFn: (slug: string) => resetPlan(slug), invalidate: inv, success: "admPlans.resetDone" });
