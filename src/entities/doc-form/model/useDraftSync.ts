import { useCallback, useEffect, useRef } from "react";
import { useDraftStore, type Draft } from "./draftStore";

type Snapshot = Omit<Draft, "at">;

// Saves the draft ~600 ms after the last change and once more on leaving, so the
// typed text survives a closed app. `finish()` removes it (document generated).
export function useDraftSync(key: string, snap: Snapshot) {
  const save = useDraftStore((s) => s.save);
  const drop = useDraftStore((s) => s.drop);
  const latest = useRef(snap);
  const done = useRef(false);
  useEffect(() => {
    latest.current = snap;
  });
  const { answers, step, need, requestId } = snap;
  useEffect(() => {
    if (done.current) return;
    const id = setTimeout(() => save(key, { answers, step, need, requestId }), 600);
    return () => clearTimeout(id);
  }, [key, answers, step, need, requestId, save]);
  useEffect(
    () => () => {
      if (!done.current) save(key, latest.current);
    },
    [key, save],
  );
  const finish = useCallback(() => {
    done.current = true;
    drop(key);
  }, [key, drop]);
  return { finish };
}
