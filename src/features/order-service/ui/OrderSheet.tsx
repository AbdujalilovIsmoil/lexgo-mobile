import { useRouter } from "expo-router";
import { useKept } from "@/shared/lib/useKept";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { BottomSheet, SheetScroll } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { OrderTarget } from "../model/useOrderPanel";
import { OrderPanel } from "./OrderPanel";

type Props = { service: (OrderTarget & { price?: number }) | null; preSeller?: { id: string; name: string }; packageId?: string; onClose: () => void };

// The order modal of the catalogue, as a drawer. The private chat opens from the payment step.
export function OrderSheet({ service: current, preSeller, packageId, onClose }: Props) {
  const { t } = useT();
  const router = useRouter();
  const service = useKept(current);
  const go = useSheetNavigate(onClose);
  return (
    <BottomSheet visible={!!current} onClose={onClose} title={service?.name ?? t("csv.orderTitle")} snaps={[0.8, 0.94]}>
      <SheetScroll>
        {service ? <OrderPanel key={service.id} service={service} preSeller={preSeller} packageId={packageId} onChat={() => go(() => router.navigate("/(tabs)/orders"))} /> : null}
      </SheetScroll>
    </BottomSheet>
  );
}
