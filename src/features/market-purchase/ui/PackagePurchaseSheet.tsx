import { useState } from "react";
import { useRouter } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import type { PackageSeller, ServicePackage } from "@/entities/package";
import { BottomSheet, SheetScroll } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { PackageCheckout } from "./PackageCheckout";
import { SellerStep } from "./SellerStep";

type Props = { pkg: ServicePackage | null; onClose: () => void };

// "Order" on a package tier: choose one of the sellers who enabled it, then the options, the quote and the request.
export function PackagePurchaseSheet({ pkg, onClose }: Props) {
  const { t } = useT();
  const router = useRouter();
  const authed = useIsAuthed();
  const [seller, setSeller] = useState<PackageSeller | null>(null);
  const close = () => { setSeller(null); onClose(); };
  const leave = (fn: () => void) => { close(); setTimeout(fn, 250); };
  const login = () => leave(() => router.push("/auth/login"));
  const pick = (x: PackageSeller) => (authed ? setSeller(x) : login());
  return (
    <BottomSheet visible={!!pkg} onClose={close} title={pkg ? `${pkg.title} · ${pkg.tariff}` : t("ntd.pk.title")} snaps={[0.85, 0.95]}>
      {pkg ? (
        <SheetScroll>
          {seller ? <PackageCheckout pkg={pkg} seller={seller} onBack={() => setSeller(null)} onOrders={() => leave(() => router.navigate("/(tabs)/orders"))} onChat={(room) => leave(() => router.push({ pathname: "/chat/[roomId]", params: { roomId: room } }))} onLogin={login} onClose={() => setSeller(null)} /> : <SellerStep pkg={pkg} onPick={pick} />}
        </SheetScroll>
      ) : null}
    </BottomSheet>
  );
}
