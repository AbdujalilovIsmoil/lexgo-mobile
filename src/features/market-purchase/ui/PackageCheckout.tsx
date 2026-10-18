import { StyleSheet, View } from "react-native";
import type { PackageSeller, ServicePackage } from "@/entities/package";
import { Card, SheetBack, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { usePackagePurchase } from "../model/usePackagePurchase";
import { PurchaseForm } from "./PurchaseForm";
import { PurchaseReceipt } from "./PurchaseReceipt";
import { PurchaseSteps } from "./PurchaseSteps";

type Props = { pkg: ServicePackage; seller: PackageSeller; onBack: () => void; onOrders: () => void; onChat: (roomId: string) => void; onLogin: () => void; onClose: () => void };

// Step 2: options (multi-select, optional) → the backend quote → the purchase request to that seller → wait for the Telegram approval.
export function PackageCheckout({ pkg, seller, onBack, onOrders, onChat, onLogin, onClose }: Props) {
  const { t } = useT();
  const p = usePackagePurchase(pkg, seller, onLogin);
  const room = p.found?.canStartChat ? p.found.roomId : "";
  return (
    <View style={s.col}>
      {p.phase ? null : <SheetBack onPress={onBack} />}
      <PurchaseSteps phase={p.phase} />
      <Card tinted style={s.ticket}>
        <View style={s.flex}>
          <Text variant="caption" tone="gray">{seller.name} · {pkg.tariff}</Text>
          <Text variant="body" weight="bold" numberOfLines={3}>{pkg.title}</Text>
        </View>
        <Text variant="h3" tone="accent">{fmtMoney(p.tracked?.amount || p.q.quote?.totalPrice || pkg.price)} <Text variant="caption" tone="gray2">{t("common.currency")}</Text></Text>
      </Card>
      {p.tracked && p.phase ? (
        <PurchaseReceipt phase={p.phase} tracked={p.tracked} roomId={room} checking={p.checking} onCheck={() => void p.check()} onOrders={onOrders} onChat={() => onChat(room)} onRetry={p.reset} onClose={onClose} />
      ) : (
        <PurchaseForm p={p} blocked="" />
      )}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 14 }, ticket: { flexDirection: "row", alignItems: "center", gap: 12 }, flex: { flex: 1, gap: 2 } });
