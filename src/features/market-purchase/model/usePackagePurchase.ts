import { requestPackagePurchase, type PreferredChannel } from "@/entities/order";
import type { PackageSeller, ServicePackage } from "@/entities/package";
import { quotePackage, usePackageOptions } from "@/entities/price-option";
import { usePurchaseCore } from "./usePurchaseCore";

// The purchase request of one package tier with one chosen seller: POST that seller's `package_purchase_url`.
export function usePackagePurchase(pkg: ServicePackage, seller: PackageSeller, onLogin: () => void) {
  return usePurchaseCore({
    options: usePackageOptions(pkg.id),
    quote: (ids) => quotePackage(pkg.id, ids),
    send: (v: { note: string; time: string; channel: PreferredChannel; optionIds: string[] }) => requestPackagePurchase(seller.purchaseUrl, v),
    onLogin,
  });
}
