import { useState } from "react";
import { View } from "react-native";
import { useAccess } from "@/entities/access";
import { PaymentHistory, PayoutsList } from "@/widgets/payments";
import { AdminPage } from "@/shared/ui/admin";
import { Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Payments and receipts; sellers also get their payouts (read-only) next to them.
export function PaymentsPage() {
  const { t } = useT();
  const seller = useAccess().seller;
  const [tab, setTab] = useState<"pay" | "earn">("pay");
  return (
    <AdminPage title={t("py1.title")}>
      {seller ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <Segmented value={tab} onChange={setTab} options={[{ value: "pay", label: t("py1.earn.tabPay") }, { value: "earn", label: t("py1.earn.tab") }]} />
        </View>
      ) : null}
      {seller && tab === "earn" ? <PayoutsList /> : <PaymentHistory />}
    </AdminPage>
  );
}
