import { useState } from "react";

export const PAGE = 10;

// Shows a long list ten rows at a time: `visible` grows by ten per tap, `left` is what is still hidden.
// The window starts over whenever `reset` changes (a new filter or search).
export function useShowMore<T>(rows: T[], reset = "") {
  const [s, setS] = useState({ n: PAGE, key: reset });
  const n = s.key === reset ? s.n : PAGE;
  return {
    visible: rows.slice(0, n),
    left: Math.max(0, rows.length - n),
    more: () => setS({ n: n + PAGE, key: reset }),
    less: () => setS({ n: PAGE, key: reset }),
    expanded: n > PAGE,
  };
}
