import { useState } from "react";
import { View } from "react-native";
import { FormSheet } from "@/shared/ui/admin";
import { Icon, Input, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { cardOk, expiryOk, formatCard, formatExpiry } from "@/shared/lib/card";
import { useKept } from "@/shared/lib/useKept";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { PAYMENTS_CONNECTED } from "../model/connected";
import type { CardGateAsk } from "../model/useCardGate";

type Props = { ask: CardGateAsk | null; onClose: () => void; onConfirm: () => void };

// Asked before a paid request goes out: what it costs and the card to pay with. The number is only checked here (length, Luhn,
// expiry) and cleared when the sheet closes — it is never stored, logged or sent; the provider's own page takes the payment.
// The request is sent only by the confirm button below, never by itself. While no payment system is connected (PAYMENTS_CONNECTED) the
// confirm button says so instead and nothing is sent.
export function CardGateSheet({ ask, onClose, onConfirm }: Props) {
  const { t } = useT();
  const c = useColors();
  const a = useKept(ask);
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [tried, setTried] = useState(false);
  const [off, setOff] = useState(false); // the card was entered, but no payment system is connected yet
  useSheetReset(!!ask, () => { setCard(""); setExp(""); setTried(false); setOff(false); });
  const cardValid = cardOk(card);
  const expValid = expiryOk(exp);
  const submit = () => {
    if (!cardValid || !expValid) return setTried(true);
    setCard("");
    setExp("");
    if (PAYMENTS_CONNECTED) onConfirm();
    else setOff(true);
  };
  return (
    <FormSheet visible={!!ask} onClose={onClose} title={t("cg.title")} subtitle={a?.title} submitLabel={t(off ? "cg.close" : "cg.confirm")} onSubmit={off ? onClose : submit} snaps={off ? [0.5, 0.7] : [0.62, 0.92]}>
      {off ? (
        <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: c.warnBg }}><Icon name="clock" size={24} color={c.warn} /></View>
          <Text variant="h4" center>{t("cg.offTitle")}</Text>
          <Text variant="small" tone="gray" center>{t("cg.offText")}</Text>
        </View>
      ) : (
        <>
        <View style={{ gap: 4 }}>
          <Text variant="small" tone="gray">{t("cg.amount")}</Text>
          <Text variant="h2">{a ? `${fmtMoney(a.amount)} ${t("common.currency")}` : ""}</Text>
        </View>
        <Input
          label={t("cg.number")}
          placeholder="0000 0000 0000 0000"
          value={card}
          onChangeText={(v) => setCard(formatCard(v))}
          keyboardType="number-pad"
          autoComplete="cc-number"
          textContentType="creditCardNumber"
          error={tried && !cardValid ? t("cg.numberBad") : undefined}
          left={<Icon name="credit-card" size={18} color={c.gray2} />}
        />
        <Input
          label={t("cg.expiry")}
          placeholder="MM/YY"
          value={exp}
          onChangeText={(v) => setExp(formatExpiry(v))}
          keyboardType="number-pad"
          autoComplete="cc-exp"
          error={tried && !expValid ? t("cg.expiryBad") : undefined}
        />
        <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
          <Icon name="lock" size={14} color={c.gray2} />
          <Text variant="caption" tone="gray2" style={{ flex: 1 }}>{t("cg.note")}</Text>
        </View>
        </>
      )}
    </FormSheet>
  );
}
