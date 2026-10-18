import { useQuery } from "@tanstack/react-query";
import { useBizMutation } from "@/shared/lib/useBizMutation";
import { enablePackage, listPackages, setPackageStatus } from "../api/packageApi";

export const sellerPackageKeys = { all: ["seller-package"] as const };
const inv = [sellerPackageKeys.all];

export const useSellerPackages = () => useQuery({ queryKey: sellerPackageKeys.all, queryFn: listPackages });

export const useEnablePackage = () => useBizMutation({ mutationFn: enablePackage, invalidate: inv, success: "pkgSeller.toast.enable" });

// Two fixed-target hooks so each shows its own toast.
export const usePausePackage = () => useBizMutation({ mutationFn: (id: string) => setPackageStatus(id, "disabled"), invalidate: inv, success: "pkgSeller.toast.disabled" });
export const useResumePackage = () => useBizMutation({ mutationFn: (id: string) => setPackageStatus(id, "active"), invalidate: inv, success: "pkgSeller.toast.active" });
