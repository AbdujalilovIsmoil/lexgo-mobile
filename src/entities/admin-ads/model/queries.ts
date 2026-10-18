import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createAd, deleteAd, listAds, updateAd } from "../api/adApi";
import type { AdInput } from "./types";

export const adKeys = { all: ["admin-ads"] as const };
const inv = [adKeys.all];

export const useAds = () => useQuery({ queryKey: [...adKeys.all, "list"], queryFn: listAds });
export const useCreateAd = () => useAdminMutation({ mutationFn: (b: AdInput) => createAd(b), invalidate: inv, success: "admAds.created" });
export const useUpdateAd = () => useAdminMutation({ mutationFn: (v: { id: string; body: Partial<AdInput> }) => updateAd(v.id, v.body), invalidate: inv, success: "admAds.saved" });
export const useDeleteAd = () => useAdminMutation({ mutationFn: (id: string) => deleteAd(id), invalidate: inv, success: "admAds.deleted" });
