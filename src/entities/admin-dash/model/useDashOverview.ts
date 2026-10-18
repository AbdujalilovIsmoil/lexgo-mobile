import { useMemo } from "react";
import { isoDay } from "@/shared/lib/format";
import { demoAdminDash, demoQuality } from "./demo/demoDash";
import { demoCeo } from "./demo/demoCeo";
import { demoRetention } from "./demo/demoMisc";
import { useDemoStore } from "./demoStore";
import { isCeoEmpty, isDashEmpty, isQualityEmpty, isRetentionEmpty } from "./empty";
import { useAdminDashQuery, useCeoQuery, useQualityQuery, useRetentionQuery } from "./queries";
import type { DashFilter } from "./types";

// The overview page reads four endpoints at once; each may fail on its own (tiles then show "—").
// Demo data replaces all four together, never a mix.
export function useDashOverview(f: DashFilter) {
  const forced = useDemoStore((s) => s.forced);
  const dash = useAdminDashQuery(f);
  const ceo = useCeoQuery(f);
  const ret = useRetentionQuery(f);
  const qual = useQualityQuery(f);
  const all = [dash, ceo, ret, qual];
  const loaded = all.every((q) => !q.isLoading);
  const failed = loaded && all.every((q) => q.isError);
  const blank = (ok: boolean, empty: boolean) => !ok || empty;
  const quiet = loaded && !failed && blank(dash.isSuccess, !!dash.data && isDashEmpty(dash.data)) && blank(ceo.isSuccess, !!ceo.data && isCeoEmpty(ceo.data))
    && blank(ret.isSuccess, !!ret.data && isRetentionEmpty(ret.data)) && blank(qual.isSuccess, !!qual.data && isQualityEmpty(qual.data));
  const demo = forced || quiet;
  const view = useMemo(() => {
    if (!demo) return { d: dash.data, c: ceo.data, r: ret.data, q: qual.data };
    const today = isoDay();
    return { d: demoAdminDash(today), c: demoCeo(today), r: demoRetention(today), q: demoQuality() };
  }, [demo, dash.data, ceo.data, ret.data, qual.data]);
  return {
    ...view,
    demo,
    isLoading: !forced && !loaded,
    isError: !forced && failed,
    error: all.find((q) => q.error)?.error,
    isRefetching: all.some((q) => q.isRefetching),
    refetch: () => Promise.all(all.map((q) => q.refetch())),
  };
}
export type DashOverview = ReturnType<typeof useDashOverview>;
