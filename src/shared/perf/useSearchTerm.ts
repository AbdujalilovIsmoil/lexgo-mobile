import { useState } from "react";
import { useDebounced } from "@/shared/lib/useDebounced";

export const SEARCH_DEBOUNCE_MS = 400; // TZ 39: 350-500 ms

/** Search box state: `text` follows the keyboard, `term` (trimmed) settles 400 ms after the last key. */
export function useSearchTerm(ms = SEARCH_DEBOUNCE_MS) {
  const [text, setText] = useState("");
  const term = useDebounced(text.trim(), ms);
  return { text, setText, term, pending: text.trim() !== term };
}
