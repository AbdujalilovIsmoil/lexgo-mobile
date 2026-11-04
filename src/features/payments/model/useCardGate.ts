import { useCallback, useState } from "react";

export type CardGateAsk = { amount: number; title: string; run: () => void };

// The step in front of every paid request: a free one (amount 0) runs at once, a paid one waits until the card is entered in
// CardGateSheet. Nothing is sent before that — `run` is only called from the sheet's confirm button. The card itself is never kept.
export function useCardGate() {
  const [ask, setAsk] = useState<CardGateAsk | null>(null);
  const request = useCallback((amount: number, title: string, run: () => void) => {
    if (amount > 0) setAsk({ amount, title, run });
    else run();
  }, []);
  const close = useCallback(() => setAsk(null), []);
  const confirm = useCallback(() => {
    const a = ask;
    setAsk(null);
    a?.run();
  }, [ask]);
  return { request, sheet: { ask, onClose: close, onConfirm: confirm } };
}
