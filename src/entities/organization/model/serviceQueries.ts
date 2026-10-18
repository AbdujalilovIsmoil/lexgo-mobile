import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { addMemberService, listMemberServices, removeMemberService, setMemberServiceStatus, updateMemberService } from "../api/serviceApi";
import { listPromoPackages, requestPromotion } from "../api/promoApi";
import { orgKeys } from "./keys";
import type { PromoPackage, ServiceInput, ServiceStatus } from "./serviceTypes";

export const useMemberServices = (org: string, member: string) => {
  const { locale } = useT();
  return useQuery({ queryKey: [...orgKeys.services(org, member), locale], queryFn: () => listMemberServices(org, member, locale), enabled: !!org && !!member, retry: false });
};

export const usePromoPackages = (enabled: boolean) => useQuery({ queryKey: orgKeys.packages, queryFn: listPromoPackages, enabled, staleTime: 5 * 60_000 });

// Every write refetches the member's service list (the backend recomputes visibility and limits).
export function useServiceWrites(org: string, member: string) {
  const { t, locale } = useT();
  const qc = useQueryClient();
  const invalidate = [orgKeys.services(org, member)];
  // The form explains a rejected save itself (price range, advocate-only …), so no error toast here.
  const save = useMutation({
    mutationFn: (v: { input: ServiceInput; create: boolean }) => (v.create ? addMemberService(org, member, v.input, locale) : updateMemberService(org, member, v.input, locale)),
    onSuccess: () => {
      successHaptic();
      toast(t("og5.saved"), "ok");
      void qc.invalidateQueries({ queryKey: invalidate[0] });
    },
  });
  const status = useAdminMutation({ mutationFn: (v: { id: string; status: ServiceStatus }) => setMemberServiceStatus(org, member, v.id, v.status, locale), invalidate, success: "og5.statusSaved" });
  const remove = useAdminMutation({ mutationFn: (id: string) => removeMemberService(org, member, id), invalidate, success: "og5.removed" });
  const promote = useMutation({ mutationFn: (v: { id: string; pkg: PromoPackage }) => requestPromotion(org, member, v.id, v.pkg), onSuccess: () => void qc.invalidateQueries({ queryKey: invalidate[0] }) });
  return { save, status, remove, promote };
}
