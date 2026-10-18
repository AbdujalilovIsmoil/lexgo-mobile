import { useEffect } from "react";
import { useRouter } from "expo-router";
import { hasTemplate, useServicePassport, type Service } from "@/entities/service";

// Deep link from the AI offer cards (?service=<id>): a document service goes to its builder, any
// other opens the order sheet; a service outside the loaded catalogue is read through its passport.
export function useDeepService(id: string, onOrder: (s: Service) => void) {
  const router = useRouter();
  const found = useServicePassport(id).data?.service;
  useEffect(() => {
    if (!found?.id) return;
    if (hasTemplate(found)) router.replace(`/services/${found.id}/fill` as never);
    else onOrder(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found?.id]);
}
