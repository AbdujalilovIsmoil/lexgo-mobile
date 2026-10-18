import { useCallback } from "react";
import { useDraftStore } from "./draftStore";

// Draft of one form: `draft` is what was typed but not saved yet (undefined = nothing to restore).
export function useDraft<T extends Record<string, unknown>>(userId: string, section: string) {
  const key = `${userId}:${section}`;
  const draft = useDraftStore((s) => s.drafts[key]) as T | undefined;
  const save = useDraftStore((s) => s.save);
  const drop = useDraftStore((s) => s.drop);
  return {
    draft,
    store: useCallback((v: T) => save(key, v), [save, key]),
    clear: useCallback(() => drop(key), [drop, key]),
  };
}
