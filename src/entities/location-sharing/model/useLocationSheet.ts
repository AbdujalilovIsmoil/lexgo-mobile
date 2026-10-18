import { useCallback, useState } from "react";

// Open / close state for LocationSheet.
export function useLocationSheet() {
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  return { visible, open, close };
}
