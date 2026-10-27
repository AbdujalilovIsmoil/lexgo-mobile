import type { QueryClient } from "@tanstack/react-query";
import { getRaMeta } from "../api/raApi";
import type { RaMeta } from "./types";

export const raKeys = {
  all: ["remote-assist"] as const,
  meta: ["remote-assist", "meta"] as const,
};

// The runtime contract (TZ RA §6) is read once per signed-in session and kept: no screen observes it, so a socket resync does not
// read it again. A sign-out / role change clears the whole cache, and the next client session reads it anew.
const meta = { queryKey: raKeys.meta, queryFn: getRaMeta, staleTime: Infinity, gcTime: Infinity } as const;

export const ensureRaMeta = (qc: QueryClient): Promise<RaMeta> => qc.ensureQueryData(meta);
export const peekRaMeta = (qc: QueryClient): RaMeta | null => qc.getQueryData<RaMeta>(raKeys.meta) ?? null;
