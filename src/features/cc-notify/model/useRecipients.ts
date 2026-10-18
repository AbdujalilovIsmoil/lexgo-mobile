import { useState } from "react";

export type Picked = { id: string; name: string };

// The clients a notification goes to: toggle one, remove one, clear; may start with a client from the client card.
export function useRecipients(first: Picked | null) {
  const [picked, setPicked] = useState<Picked[]>(first ? [first] : []);
  const toggle = (c: Picked) => setPicked((cur) => (cur.some((p) => p.id === c.id) ? cur.filter((p) => p.id !== c.id) : [...cur, c]));
  return { picked, toggle, remove: (id: string) => setPicked((cur) => cur.filter((p) => p.id !== id)), clear: () => setPicked([]) };
}
