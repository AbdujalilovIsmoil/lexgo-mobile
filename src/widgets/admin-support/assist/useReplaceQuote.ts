import { quotePackage, quoteService, useQuote, usePackageOptions, useServiceOptions } from "@/entities/price-option";
import type { AssistOrder } from "@/entities/admin-support";

// Replacement options of a paid order: the Studio options of its service/package + the backend quote of the new selection.
export function useReplaceQuote(o: AssistOrder | null, on: boolean) {
  const isPkg = !!o?.packageId;
  const svc = useServiceOptions(o?.serviceId ?? "", on && !isPkg);
  const pkg = usePackageOptions(o?.packageId ?? "", on && isPkg);
  const opts = isPkg ? pkg : svc;
  const quote = useQuote((ids) => (isPkg ? quotePackage(o?.packageId ?? "", ids) : quoteService(o?.serviceId ?? "", o?.lawyerUserId ?? "", ids)), on && !!o && !opts.isLoading);
  return { opts, quote };
}
