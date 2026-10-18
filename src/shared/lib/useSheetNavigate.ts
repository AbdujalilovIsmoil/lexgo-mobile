import { useCallback } from "react";

// A native Modal must be fully gone before the router can present another
// screen on iOS. This closes the sheet, waits for its exit animation, then runs `fn`.
export function useSheetNavigate(close: () => void) {
  return useCallback(
    (fn: () => void) => {
      close();
      setTimeout(fn, 340);
    },
    [close],
  );
}
