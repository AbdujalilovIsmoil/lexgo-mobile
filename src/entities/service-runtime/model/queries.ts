import { useQuery } from "@tanstack/react-query";
import { useLocaleStore } from "@/shared/i18n";
import { getServiceRuntime } from "../api/runtimeApi";

// The one reader of the endpoint: the service page, its duration tile and the specialist's guarantees box share this query — one request
// per opened service, never one per list row. The texts may come in the asked language (Accept-Language), hence the locale in the key.
export function useServiceRuntime(serviceId?: string, placement = "service_detail") {
  const locale = useLocaleStore((s) => s.locale);
  const id = (serviceId ?? "").trim();
  return useQuery({ queryKey: ["service-runtime", id, placement, locale], queryFn: () => getServiceRuntime(id, placement), enabled: !!id, staleTime: 5 * 60 * 1000 });
}
