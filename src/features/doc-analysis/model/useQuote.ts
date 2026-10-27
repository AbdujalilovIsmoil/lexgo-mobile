import { useState } from "react";
import { quoteAnalysis, type DocQuote, type QuoteInput } from "@/entities/doc-analysis";
import { useDocRefusal } from "@/entities/doc-settings";

const keyOf = (o: QuoteInput) => `${o.pageCount}|${o.ocr}|${o.lawyerReview}|${o.urgent}|${Boolean(o.writtenOpinion)}`;

// POST /ai/document-analysis/quote for the current options. A quote is "fresh" only while the options still match the ones it was asked for;
// a failed call never blocks the analysis. `why` is the backend's refusal in plain words when the document service closed it (TZ.md §4).
export function useQuote(input: QuoteInput) {
  const refusal = useDocRefusal();
  const [quote, setQuote] = useState<{ key: string; q: DocQuote } | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [why, setWhy] = useState("");
  const fresh = quote && quote.key === keyOf(input) ? quote.q : null;

  const get = async (i: QuoteInput = input): Promise<DocQuote | null> => {
    setBusy(true);
    setFailed(false);
    try {
      const q = await quoteAnalysis(i);
      setQuote({ key: keyOf(i), q });
      return q;
    } catch (e) {
      setFailed(true);
      setWhy(refusal(e) ?? "");
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { fresh, busy, failed, why, get };
}
