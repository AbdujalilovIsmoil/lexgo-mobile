import { usePackageOptions, useServiceOptions } from "@/entities/price-option";
import type { ProOrder } from "@/entities/pro-order";

// A package order reads the package's options (they include its components'), any other the service's.
export function useOrderOptions(order: ProOrder, on: boolean) {
  const pkg = usePackageOptions(order.packageId, on && !!order.packageId);
  const svc = useServiceOptions(order.serviceId, on && !order.packageId);
  return order.packageId ? pkg : svc;
}
