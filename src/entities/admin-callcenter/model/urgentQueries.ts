import { useQuery } from "@tanstack/react-query";
import { getUrgent, listUrgent } from "../api/urgentApi";
import { listCandidates, searchCandidates } from "../api/candidateApi";
import { ccKeys, LIVE_MS } from "./keys";
import { useLiveMs } from "./useLiveMs";

// The web listens on a websocket; the app polls the pool and the open record every few seconds instead.
export const useUrgentList = (f: { kind: string; channel: string }) =>
  useQuery({ queryKey: [...ccKeys.urgent, "list", f.kind, f.channel], queryFn: () => listUrgent(f), refetchInterval: useLiveMs(LIVE_MS) });

export const useUrgentDetail = (id: string, enabled = true) =>
  useQuery({ queryKey: [...ccKeys.urgent, "detail", id], queryFn: () => getUrgent(id), enabled: !!id && enabled, refetchInterval: useLiveMs(enabled ? LIVE_MS : 0) || false });

type Opts = { external: boolean; callcenter: boolean };

// Ranked advocates for one request (group assignment, transfer).
export const useCandidates = (id: string, o: Opts, enabled = true) =>
  useQuery({ queryKey: [...ccKeys.urgent, "cand", id, o.external, o.callcenter], queryFn: () => listCandidates(id, o), enabled: !!id && enabled });

// "Wider search": the same ranking by hand-picked directions and region; re-run when `applied` changes.
export const useWideCandidates = (p: { directions: string[]; region: string }, applied: number, enabled: boolean) =>
  useQuery({ queryKey: [...ccKeys.urgent, "wide", applied], queryFn: () => searchCandidates(p), enabled });
