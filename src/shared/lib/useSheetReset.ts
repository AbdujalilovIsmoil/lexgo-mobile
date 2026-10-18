import { useState } from "react";

// Runs `reset` once every time a sheet goes from closed to open. The state is derived while
// rendering (like useKept), so the form is already clean on the first frame of the sheet.
export function useSheetReset(visible: boolean, reset: () => void): void {
  const [was, setWas] = useState(false);
  if (visible !== was) {
    setWas(visible);
    if (visible) reset();
  }
}
