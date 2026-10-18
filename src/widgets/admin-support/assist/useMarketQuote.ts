import { quotePackage, quoteService, useQuote, usePackageOptions, useServiceOptions } from "@/entities/price-option";
import type { ServicePackage } from "@/entities/package";
import type { Seller } from "@/entities/admin-support";

type In = { isPkg: boolean; seller: Seller | null; serviceId: string; pkg: ServicePackage | null };

// Price options + the backend quote of the current choice. The total is never computed here; `settled` gates the submit.
export function useMarketQuote({ isPkg, seller, serviceId, pkg }: In) {
  const svcOpts = useServiceOptions(serviceId, !isPkg && !!seller);
  const pkgOpts = usePackageOptions(pkg?.id ?? "", isPkg && !!seller);
  const opts = isPkg ? pkgOpts : svcOpts;
  const target = !!seller && (isPkg ? !!pkg : !!serviceId);
  const quote = useQuote((ids) => (isPkg ? quotePackage(pkg?.id ?? "", ids) : quoteService(serviceId, seller?.userId ?? "", ids)), target && !opts.isLoading);
  return { opts, quote, target };
}
