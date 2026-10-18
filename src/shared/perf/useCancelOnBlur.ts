import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";

/**
 * Cancels in-flight queries when the screen loses focus (TZ 39: no request for a screen nobody
 * sees). Pass a module-level constant: useCancelOnBlur(KEYS). `http()` aborts the fetch when the
 * queryFn forwards react-query's signal: queryFn: ({ signal }) => http(path, { signal }).
 */
export function useCancelOnBlur(keys: readonly (readonly unknown[])[]): void {
  const qc = useQueryClient();
  useFocusEffect(
    useCallback(() => {
      return () => {
        for (const queryKey of keys) void qc.cancelQueries({ queryKey });
      };
    }, [qc, keys]),
  );
}

/** An AbortSignal that fires when the screen blurs, for plain fetches outside react-query. */
export function useBlurSignal(): () => AbortSignal {
  const ctl = useRef<AbortController | null>(null);
  useFocusEffect(
    useCallback(() => {
      ctl.current = new AbortController();
      return () => ctl.current?.abort();
    }, []),
  );
  return useCallback(() => (ctl.current ??= new AbortController()).signal, []);
}
