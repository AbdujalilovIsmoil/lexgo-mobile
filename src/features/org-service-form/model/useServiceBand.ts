import { useQuery } from "@tanstack/react-query";
import { quoteTotal, type PriceBand } from "@/entities/organization";

// The allowed price range of one service for one member comes from the server only (the item's
// pricing_limits, or the range of a rejected save). Until then the quote is shown as an estimate:
// it ignores seller premiums, so it is never used to block a price.
export function useServiceBand(serviceId: string, memberId: string, region: string, known: PriceBand | null) {
  const q = useQuery({
    queryKey: ["org", "quote", serviceId, memberId, region],
    queryFn: () => quoteTotal(serviceId, memberId, region),
    enabled: !!serviceId && !known,
    staleTime: 10 * 60_000,
    retry: false,
  });
  return { band: known, estimate: known ? 0 : (q.data ?? 0), loading: !!serviceId && !known && q.isLoading };
}
