import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useT } from "@/shared/i18n";
import { createCategory, listCategories, removeCategory, resetCategory, restoreCategory, saveCategory } from "../api/categoryApi";
import { searchServiceIds } from "../api/extraApi";
import { createService, deleteService, listServices, updateService } from "../api/serviceApi";
import type { ServiceCreate, ServiceUpdate } from "./types";

export const svcKeys = { all: ["admin-services"] as const, cats: ["admin-services", "categories"] as const };
const inv = [svcKeys.all];

export const useCategories = () => useQuery({ queryKey: svcKeys.cats, queryFn: listCategories });
export const useServices = (categoryId: string, isActive: boolean | undefined, locale: string) =>
  useQuery({ queryKey: [...svcKeys.all, "list", categoryId, isActive, locale], queryFn: () => listServices({ categoryId, isActive }, locale) });
export const useServiceSearch = (term: string) =>
  useQuery({ queryKey: [...svcKeys.all, "search", term], queryFn: () => searchServiceIds(term), enabled: term.length >= 2, retry: false });

export const useCreateCategory = () => useAdminMutation({ mutationFn: createCategory, invalidate: inv, success: "admSvc.catCreated" });
// Category edits answer with where they landed; "overlay" means the policy fallback was used.
export const useRenameCategory = () => useAdminMutation({ mutationFn: (v: { id: string; title: string }) => saveCategory(v.id, v.title), invalidate: inv, success: "admSvc.catSaved" });
export const useHideCategory = () => useAdminMutation({ mutationFn: removeCategory, invalidate: inv, success: "admSvc.catHidden" });
export const useRestoreCategory = () => useAdminMutation({ mutationFn: restoreCategory, invalidate: inv, success: "admSvc.catRestored" });
export const useResetCategory = () => useAdminMutation({ mutationFn: resetCategory, invalidate: inv, success: "admSvc.catReset" });

export const useCreateService = () => useAdminMutation({ mutationFn: (b: ServiceCreate) => createService(b), invalidate: inv, success: "admSvc.created" });
export function useUpdateService(success = "admSvc.saved") {
  const { locale } = useT();
  return useAdminMutation({ mutationFn: (v: { id: string; body: ServiceUpdate }) => updateService(v.id, v.body, locale), invalidate: inv, success });
}
export const useDeleteService = () => useAdminMutation({ mutationFn: deleteService, invalidate: inv, success: "admSvc.deleted" });
