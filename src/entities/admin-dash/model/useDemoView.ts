import { useMemo } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { isoDay } from "@/shared/lib/format";
import { useDemoStore } from "./demoStore";

// A dashboard payload as the screen sees it: real data, or labelled demo data when the
// "show demo" switch is on or the platform has no activity yet (as on the web).
export type DashView<T> = {
  data: T | undefined;
  demo: boolean;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isRefetching: boolean;
  refetch: () => unknown;
};

export function useDemoView<T>(q: UseQueryResult<T>, isEmpty: (d: T) => boolean, make: (today: string) => T): DashView<T> {
  const forced = useDemoStore((s) => s.forced);
  const demo = forced || (q.isSuccess && isEmpty(q.data));
  const data = useMemo(() => (demo ? make(isoDay()) : q.data), [demo, q.data, make]);
  return { data, demo, isLoading: !forced && q.isLoading, isError: !demo && q.isError, error: q.error, isRefetching: q.isRefetching, refetch: q.refetch };
}
