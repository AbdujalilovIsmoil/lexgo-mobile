import { useCallback, useEffect, useRef, useState } from "react";
import { cacheDelete, cacheGet, cacheSet, DAY } from "./kv";

const keyOf = (name: string): string => `draft:${name}`;
export const draftSet = (name: string, value: unknown): Promise<void> => cacheSet(keyOf(name), value, 14 * DAY);
export const draftGet = <T,>(name: string): Promise<T | null> => cacheGet<T>(keyOf(name));
export const draftClear = (name: string): Promise<void> => cacheDelete(keyOf(name));

type DraftApi<T> = { value: T; setValue: (v: T | ((p: T) => T)) => void; clear: () => void; ready: boolean };

/**
 * Form state that survives a restart or a crash (saved 600 ms after the last change, per user,
 * wiped on logout). `omit` names fields that must never touch the disk (passport numbers…).
 * Call clear() once the form was submitted.
 */
export function useDraft<T extends object>(name: string, initial: T, omit: (keyof T)[] = []): DraftApi<T> {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const base = useRef(initial);
  const skip = useRef(omit);
  const dirty = useRef(false);
  useEffect(() => {
    let alive = true;
    void draftGet<Partial<T>>(name).then((saved) => {
      if (!alive) return;
      if (saved) setValue({ ...base.current, ...saved });
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [name]);
  useEffect(() => {
    if (!ready || !dirty.current) return;
    const id = setTimeout(() => {
      const copy = { ...value } as Record<string, unknown>;
      for (const k of skip.current) delete copy[k as string];
      void draftSet(name, copy);
    }, 600);
    return () => clearTimeout(id);
  }, [value, ready, name]);
  const update = useCallback((v: T | ((p: T) => T)) => {
    dirty.current = true;
    setValue(v);
  }, []);
  const clear = useCallback(() => {
    dirty.current = false;
    setValue(base.current);
    void draftClear(name);
  }, [name]);
  return { value, setValue: update, clear, ready };
}
