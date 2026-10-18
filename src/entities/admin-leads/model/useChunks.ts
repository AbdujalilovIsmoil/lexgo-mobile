import { useState } from "react";

// Local "show more" paging over an in-memory list (the board is loaded whole).
// The window starts over whenever `resetKey` changes (filters, stage).
export function useChunks<T>(items: T[], resetKey: string, size = 30) {
  const [win, setWin] = useState({ key: resetKey, n: size });
  const n = win.key === resetKey ? win.n : size;
  return { shown: items.slice(0, n), more: n < items.length, showMore: () => setWin({ key: resetKey, n: n + size }) };
}
