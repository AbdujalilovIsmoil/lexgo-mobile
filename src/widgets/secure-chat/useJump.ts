import { useEffect, useRef, useState } from "react";
import type { FlatList } from "react-native";
import type { Item } from "./threadItems";

// Jump to a quoted message and flash it. An older message is revealed first (the list pages the history) and reached
// once the list has grown.
export function useJump(items: Item[], onReveal: (id: string) => void) {
  const ref = useRef<FlatList<Item>>(null);
  const [flash, setFlash] = useState("");
  const pending = useRef("");
  const scrollTo = (id: string): boolean => {
    const index = items.findIndex((it) => it.kind === "msg" && it.msg.id === id);
    if (index < 0) return false;
    ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    setTimeout(() => setFlash(id), 0);
    setTimeout(() => setFlash(""), 1700);
    return true;
  };
  const jump = (id: string) => {
    if (scrollTo(id)) return;
    pending.current = id;
    onReveal(id);
  };
  useEffect(() => {
    if (pending.current && scrollTo(pending.current)) pending.current = "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
  return { ref, flash, jump };
}
