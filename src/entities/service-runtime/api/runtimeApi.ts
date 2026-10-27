import { http } from "@/shared/api";
import { normRuntime } from "../lib/normalize";
import type { ServiceRuntime } from "../model/types";

// GET /marketplace/services/{id}/runtime-configuration?placement=… — public for an active service (no token needed), so guests read it too.
export async function getServiceRuntime(serviceId: string, placement = "service_detail"): Promise<ServiceRuntime> {
  const qs = new URLSearchParams({ placement });
  return normRuntime(await http(`/marketplace/services/${encodeURIComponent(serviceId)}/runtime-configuration?${qs}`), serviceId, placement);
}
