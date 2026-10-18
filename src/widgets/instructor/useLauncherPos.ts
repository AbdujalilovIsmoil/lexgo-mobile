import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson } from "@/shared/lib/storage";

export type Side = "left" | "right";
type Pos = { side: Side; lift: number };
const KEY = "lexgo_ai_launcher";

// Where the user parked the floating button: the side it snaps to and how far it was dragged upwards.
export function useLauncherPos() {
  const [pos, setPos] = useState<Pos>({ side: "right", lift: 0 });
  useEffect(() => {
    void readJson<Pos>(KEY).then((p) => p && (p.side === "left" || p.side === "right") && setPos({ side: p.side, lift: Number(p.lift) || 0 }));
  }, []);
  const save = useCallback((next: Pos) => {
    setPos(next);
    void writeJson(KEY, next);
  }, []);
  return { pos, save };
}
