import { useState } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { Button, Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { DocCan, MyDoc } from "@/entities/my-document";
import { usePay } from "../model/usePay";

// Payment is requested here and confirmed ONLY by the server (TZ 27/45): the client never marks it paid.
export function PaymentCard({ doc, can, onRefresh }: { doc: MyDoc; can: DocCan; onRefresh: () => Promise<unknown> }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const pay = usePay(doc);
  if (!can.pay && !can.payWait) return null;
  const amount = doc.gate?.amount || doc.price;
  const money = amount > 0 ? `${fmtMoney(amount)} ${t("adm.currency")}` : "";
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Icon name={can.payWait ? "clock" : "credit-card"} size={18} color={can.payWait ? c.warn : c.accent} />
        <Text variant="h4" style={{ flex: 1 }}>{can.payWait ? t("dm5.waitTitle") : t("dm5.payTitle")}</Text>
        {money ? <Text variant="body" weight="bold">{money}</Text> : null}
      </View>
      <Text variant="small" tone="gray">{can.payWait ? t("dm5.waitText") : t("dm5.payText")}</Text>
      {can.payWait && doc.gate?.pageCount ? <Text variant="caption" tone="gray">{t("dm5.pages", { n: doc.gate.pageCount, free: doc.gate.includedPages, extra: doc.gate.extraPages })}</Text> : null}
      {can.payWait && doc.gate ? <Text variant="caption" tone={doc.gate.telegramSent ? "ok" : "err"}>{doc.gate.telegramSent ? t("dm5.tgOk") : t("dm5.tgFail")}</Text> : null}
      {can.pay ? <Button title={t("dm5.payAction")} icon="credit-card" full loading={pay.isPending} onPress={() => pay.mutate()} /> : null}
      {can.payWait ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button title={t("dm5.refresh")} icon="refresh-cw" variant="soft" size="sm" loading={busy} onPress={() => { setBusy(true); void onRefresh().finally(() => setBusy(false)); }} />
          {doc.paymentId ? <Button title={t("dm5.viewPayment")} icon="file-text" variant="line" size="sm" onPress={() => router.push(`/payments/${encodeURIComponent(doc.paymentId)}` as never)} /> : null}
        </View>
      ) : null}
    </Card>
  );
}
