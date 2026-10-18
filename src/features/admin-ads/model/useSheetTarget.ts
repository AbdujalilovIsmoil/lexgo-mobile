import { useState } from "react";

// A sheet that edits one record: `key` changes on every open, so the form inside always starts fresh,
// and the record stays mounted while the sheet animates out.
export function useSheetTarget<T>() {
  const [state, setState] = useState<{ target: T; key: number; visible: boolean } | null>(null);
  return {
    target: state?.target ?? null,
    key: state?.key ?? 0,
    visible: !!state?.visible,
    open: (target: T) => setState((s) => ({ target, key: (s?.key ?? 0) + 1, visible: true })),
    close: () => setState((s) => (s ? { ...s, visible: false } : s)),
  };
}
