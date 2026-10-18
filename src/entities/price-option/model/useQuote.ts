import { useEffect, useRef, useState } from "react";
import { useErrorText } from "@/shared/ui";
import type { Quote } from "./types";

type Result = { key: string; quote: Quote | null; error: unknown };

// What the buyer picked and what the backend priced it at. `quote.selectedIds` is the selection the total belongs to;
// `settled` is true only when the quote on screen answers the CURRENT selection (purchase waits for it).
// `load` is the quote call (service or package); the total is never computed locally.
export function useQuote(load: (ids: string[]) => Promise<Quote>, enabled: boolean) {
  const [ids, setIds] = useState<string[]>([]);
  const [res, setRes] = useState<Result | null>(null);
  const [nonce, setNonce] = useState(0);
  const run = useRef(load);
  const errText = useErrorText();
  useEffect(() => { run.current = load; });
  const key = `${nonce}|${[...ids].sort().join(",")}`;

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    run.current(ids)
      .then((q) => { if (live) setRes({ key, quote: q, error: null }); })
      .catch((e) => { if (live) setRes((p) => ({ key, quote: p?.quote ?? null, error: e })); });
    return () => { live = false; };
  }, [enabled, key, ids]);

  const quote = res?.quote ?? null;
  const answered = res?.key === key;
  const same = !!quote && quote.selectedIds.length === ids.length && ids.every((x) => quote.selectedIds.includes(x));
  const toggle = (id: string) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const error = answered && res?.error ? errText(res.error) : "";
  return { ids, set: setIds, toggle, clear: () => setIds([]), quote, pending: enabled && !answered, error, settled: answered && same && !error, retry: () => setNonce((n) => n + 1) };
}
