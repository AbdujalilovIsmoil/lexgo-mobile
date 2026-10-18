import { useQueries, useQuery } from "@tanstack/react-query";
import { aiSearch } from "../api/aiApi";
import { getLawyer } from "../api/profileApi";
import { lawyerKeys } from "./queries";
import type { AiMatch } from "./marketTypes";
import type { Lawyer } from "./types";

export const MIN_AI_CHARS = 3;

// POST /marketplace/ai-search for a submitted sentence (not on every keystroke); the endpoint needs a login.
export const useAiSearch = (query: string, region: string, kind: string, signedIn: boolean) =>
  useQuery({
    queryKey: ["market-ai", query, region, kind],
    queryFn: () => aiSearch(query, { region, kind }),
    enabled: signedIn && query.trim().length >= MIN_AI_CHARS,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

export type AiRow = { match: AiMatch; lawyer: Lawyer };

// The cards for AI matches: the hit's own profile, or one fetched by id (cached).
export function useAiRows(matches: AiMatch[]): { rows: AiRow[]; loading: boolean } {
  const missing = matches.filter((m) => !m.lawyer);
  const fetched = useQueries({ queries: missing.map((m) => ({ queryKey: lawyerKeys.one(m.userId), queryFn: () => getLawyer(m.userId), staleTime: 5 * 60 * 1000 })) });
  const byId = new Map(missing.map((m, i) => [m.userId, fetched[i]?.data ?? null]));
  const rows = matches.flatMap((match) => {
    const lawyer = match.lawyer ?? byId.get(match.userId);
    return lawyer && lawyer.verified ? [{ match, lawyer }] : [];
  });
  return { rows, loading: fetched.some((f) => f.isLoading) };
}
