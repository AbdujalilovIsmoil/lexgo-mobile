import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createReglament, getReglament, listGaps, listReglaments, updateReglament, uploadReglament } from "../api/reglamentApi";
import { mergeReglament, needsDetails } from "../api/normReglament";
import type { GapFilter, Reglament, ReglamentInput, UploadInput } from "./types";

export const aiRegKeys = { all: ["admin-aireg"] as const };

export const useReglaments = () => useQuery({ queryKey: [...aiRegKeys.all, "list"], queryFn: listReglaments });
export const useGaps = (filter: GapFilter) => useQuery({ queryKey: [...aiRegKeys.all, "gaps", filter], queryFn: () => listGaps(filter) });

// The list row, completed with GET …/{id} when the list left out the text or the versions.
export const useReglamentDetail = (r: Reglament | null) =>
  useQuery({ queryKey: [...aiRegKeys.all, "detail", r?.id], queryFn: async () => mergeReglament(r as Reglament, await getReglament((r as Reglament).id)), enabled: !!r && needsDetails(r), staleTime: 60_000 });

// Save a reglament (a new one, or a new version of an existing one). A missing route is reported, not thrown.
export const useSaveReglament = () =>
  useAdminMutation({ mutationFn: (v: { id?: string; input: ReglamentInput }) => (v.id ? updateReglament(v.id, v.input) : createReglament(v.input)), invalidate: [aiRegKeys.all] });

export const useUploadReglament = () =>
  useAdminMutation({ mutationFn: (i: UploadInput) => uploadReglament(i), invalidate: [aiRegKeys.all] });
