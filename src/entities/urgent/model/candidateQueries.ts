import { useQuery } from "@tanstack/react-query";
import { candidatesFor, candidatesSearch } from "../api/candidateApi";
import { urgentKeys } from "./keys";

type Opts = { external: boolean; callcenter: boolean };

// Ranked advocates for one request (group assignment, transfer).
export const useCandidates = (id: string, o: Opts, enabled = true) =>
  useQuery({ queryKey: [...urgentKeys.cand, "req", id, o.external, o.callcenter], queryFn: () => candidatesFor(id, o), enabled: !!id && enabled });

// "Wider search": the same ranking by hand-picked directions and region; re-run when `applied` changes.
export const useWideCandidates = (p: { directions: string[]; region: string }, applied: number, enabled: boolean) =>
  useQuery({ queryKey: [...urgentKeys.cand, "wide", applied], queryFn: () => candidatesSearch(p), enabled });
