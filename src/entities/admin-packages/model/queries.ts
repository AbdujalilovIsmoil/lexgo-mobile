import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createPackage, listPackages, packageAction, previewPackage, simulate, updatePackage, type PkgAction } from "../api/pkgApi";
import type { PkgDraft } from "./draft";

export const pkgKeys = { all: ["admin-packages"] as const };

export const usePackages = () => useQuery({ queryKey: [...pkgKeys.all, "list"], queryFn: listPackages });
export const usePackagePreview = (id: string) => useQuery({ queryKey: [...pkgKeys.all, "preview", id], queryFn: () => previewPackage(id), enabled: !!id });
export const useSimulation = (d: PkgDraft, enabled: boolean) =>
  useQuery({ queryKey: [...pkgKeys.all, "sim", d.price, d.components], queryFn: () => simulate(d), enabled: enabled && d.components.length > 0, retry: false, staleTime: 15_000 });

export const useSavePackage = () =>
  useAdminMutation({ mutationFn: ({ id, draft }: { id?: string; draft: PkgDraft }) => (id ? updatePackage(id, draft) : createPackage(draft)), invalidate: [pkgKeys.all], success: "ag5.saved" });
export const usePackageAction = () =>
  useAdminMutation({ mutationFn: ({ id, action }: { id: string; action: PkgAction }) => packageAction(id, action), invalidate: [pkgKeys.all], success: "ag5.done" });
