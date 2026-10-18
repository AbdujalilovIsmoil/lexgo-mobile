import { demoCeo } from "./demo/demoCeo";
import { demoCalls, demoRetention } from "./demo/demoMisc";
import { isCallsEmpty, isCeoEmpty, isRetentionEmpty } from "./empty";
import { useCallsQuery, useCeoQuery, useRetentionQuery } from "./queries";
import type { DashFilter } from "./types";
import { useDemoView } from "./useDemoView";

export const useCeoView = (f: DashFilter) => useDemoView(useCeoQuery(f), isCeoEmpty, demoCeo);
export const useCallsView = (f: DashFilter) => useDemoView(useCallsQuery(f), isCallsEmpty, demoCalls);
export const useRetentionView = (f: DashFilter) => useDemoView(useRetentionQuery(f), isRetentionEmpty, demoRetention);
