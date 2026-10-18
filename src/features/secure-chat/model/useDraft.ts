import { useCallback, useState } from "react";
import { registerSessionReset } from "@/shared/lib/sessionReset";

// Unsent text survives leaving the room and coming back (TZ 38: drafts are cached). Memory only; wiped on logout.
const drafts = new Map<string, string>();
registerSessionReset(() => drafts.clear());

export function useDraft(roomId: string): [string, (v: string) => void] {
  const [text, set] = useState(() => drafts.get(roomId) ?? "");
  const setText = useCallback((v: string) => {
    if (v) drafts.set(roomId, v);
    else drafts.delete(roomId);
    set(v);
  }, [roomId]);
  return [text, setText];
}
