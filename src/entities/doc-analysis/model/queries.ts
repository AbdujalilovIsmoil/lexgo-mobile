import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserEvents } from "@/shared/realtime";
import { getDocRequestState, quoteAnalysis, type QuoteInput } from "../api/docApi";
import { phaseOf } from "../lib/phase";

export const docKeys = {
  rules: ["doc-analysis-rules"] as const,
  quote: (i: QuoteInput) => ["doc-analysis-quote", i.pageCount, i.lawyerReview, i.urgent] as const,
  request: (id: string) => ["doc-analysis-request", id] as const,
};

// The server's price rules (page bands, extra page, urgency) — shown before any upload.
export function useAnalysisRules() {
  return useQuery({ queryKey: docKeys.rules, queryFn: () => quoteAnalysis({ pageCount: 1, lawyerReview: true, urgent: false }), staleTime: 60 * 60 * 1000 });
}

// Advocate-review price for the page count the server measured.
export function useAdvocateQuote(pageCount: number, urgent: boolean) {
  const input = { pageCount, lawyerReview: true, urgent };
  return useQuery({ queryKey: docKeys.quote(input), queryFn: () => quoteAnalysis(input), enabled: pageCount > 0, staleTime: 5 * 60 * 1000 });
}

// Status of the handed-over request. Realtime events refresh it at once; while the
// fee awaits Telegram approval it is also polled every 20 s (a missed event never strands it).
export function useRequestState(id: string) {
  const qc = useQueryClient();
  useUserEvents("document_request.", () => void qc.invalidateQueries({ queryKey: docKeys.request(id) }));
  return useQuery({
    queryKey: docKeys.request(id),
    queryFn: () => getDocRequestState(id),
    enabled: !!id,
    refetchInterval: (q) => (q.state.data && phaseOf(q.state.data) !== "wait" ? false : 20_000),
  });
}
