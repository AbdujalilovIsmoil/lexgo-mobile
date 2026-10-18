import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createRelease, listReleases, listRuntime, publishRelease, validateRelease } from "../api/releaseApi";
import { studioKeys } from "./queries";
import type { ReleaseInput } from "./typesRelease";

const K = studioKeys.all;
export const useReleases = () => useQuery({ queryKey: [...K, "releases"], queryFn: listReleases });
export const useRuntime = () => useQuery({ queryKey: [...K, "runtime"], queryFn: listRuntime });
const refresh = [[...K, "releases"], [...K, "runtime"]];
export const useCreateRelease = () => useAdminMutation({ mutationFn: (i: ReleaseInput) => createRelease(i), invalidate: refresh, success: "ag9.rel.created" });
export const useValidateRelease = () => useAdminMutation({ mutationFn: (id: string) => validateRelease(id), invalidate: refresh, success: "ag9.rel.validated" });
export const usePublishRelease = () => useAdminMutation({ mutationFn: (id: string) => publishRelease(id), invalidate: [...refresh, [...K, "objects"], [...K, "counts"]], success: "ag9.rel.published" });
