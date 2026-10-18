import { useQuery } from "@tanstack/react-query";
import { useBizMutation } from "@/shared/lib/useBizMutation";
import { enablePackage, listPackages, setPackageStatus } from "../api/packageApi";

export const sellerPackageKeys = { all: ["seller-package"] as const };
const inv = [sellerPackageKeys.all];

export const useSellerPackages = () => useQuery({ queryKey: sellerPackageKeys.all, queryFn: listPackages });

export const useEnablePackage = () => useBizMutation({ mutationFn: enablePackage, invalidate: inv, success: "ntd.sellerV2.pkg.enabledDone" });

export const usePackageStatus = () =>
  useBizMutation({ mutationFn: (v: { id: string; status: "active" | "disabled" }) => setPackageStatus(v.id, v.status), invalidate: inv, success: "ntd.sellerV2.pkg.statusDone" });
