import { useState } from "react";
import { usePackages, type ServicePackage } from "@/entities/package";
import { useEligibleSellers, useSellerServices, useSellers, type Seller } from "@/entities/admin-support";

export type MarketKind = "service" | "package";

// What the operator is choosing for the client: a service or a package tier, and the seller who will do it.
export function useMarketPick(q: string, visible: boolean) {
  const [kind, setKind] = useState<MarketKind>("service");
  const [tier, setTier] = useState("BASIC");
  const [pkg, setPkg] = useState<ServicePackage | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const isPkg = kind === "package";
  const packages = usePackages();
  const search = useSellers(q, visible && !isPkg && !seller);
  const eligible = useEligibleSellers(isPkg && !seller ? pkg?.id ?? "" : "");
  const svcQ = useSellerServices(isPkg ? "" : seller?.userId ?? "");
  const tierPackages = (packages.data ?? []).filter((p) => p.active && p.tariff === tier);
  return { kind, setKind, tier, setTier, pkg, setPkg, seller, setSeller, packages, tierPackages, sellers: isPkg ? eligible : search, svcQ, isPkg };
}
