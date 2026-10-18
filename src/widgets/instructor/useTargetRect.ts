import { useEffect, useState } from "react";
import { findTarget, type Rect } from "@/shared/instructor";

type Held = { id: string; rect: Rect | null };
const same = (a: Rect | null, b: Rect | null) => a === b || (!!a && !!b && Math.abs(a.x - b.x) < 1.5 && Math.abs(a.y - b.y) < 1.5 && Math.abs(a.width - b.width) < 1.5 && Math.abs(a.height - b.height) < 1.5);

// Follows a registered target's window rectangle while a step is shown (the user may scroll or the
// layout may move). Polls lightly; state only changes when the rectangle really moved, and a rectangle
// measured for the previous step is never shown for the next one.
export function useTargetRect(targetId: string | null): Rect | null {
  const [held, setHeld] = useState<Held | null>(null);
  useEffect(() => {
    if (!targetId) return;
    let alive = true;
    const tick = async () => {
      const next = (await findTarget(targetId)?.measure()) ?? null;
      if (alive) setHeld((cur) => (cur && cur.id === targetId && same(cur.rect, next) ? cur : { id: targetId, rect: next }));
    };
    void tick();
    const id = setInterval(() => void tick(), 220);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [targetId]);
  return targetId && held?.id === targetId ? held.rect : null;
}
