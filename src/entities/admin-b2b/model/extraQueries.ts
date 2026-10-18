import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createProduct, getPipeline, getTimeline, listB2bTasks, listProducts } from "../api/extraApi";
import { b2bKeys } from "./queries";
import type { ProductInput } from "./typesExtra";

export const usePipeline = () => useQuery({ queryKey: [...b2bKeys.all, "pipeline"], queryFn: getPipeline });
export const useTimeline = (clientId: string) => useQuery({ queryKey: [...b2bKeys.all, "timeline", clientId], queryFn: () => getTimeline(clientId), enabled: !!clientId });
export const useB2bTasks = () => useQuery({ queryKey: [...b2bKeys.all, "tasks"], queryFn: listB2bTasks });
export const useProducts = () => useQuery({ queryKey: [...b2bKeys.all, "products"], queryFn: listProducts });
export const useAddProduct = () => useAdminMutation({ mutationFn: (i: ProductInput) => createProduct(i), invalidate: [[...b2bKeys.all, "products"]], success: "admB2bB.productCreated" });
