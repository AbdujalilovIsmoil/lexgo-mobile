import { StyleSheet, View } from "react-native";
import { FormSheet } from "@/shared/ui/admin";
import { Chip, IconButton, Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { MAX_MINUTES, extendSchema } from "./callSchemas";

const PRESETS = [5, 10, 15, 30];

// Host: buy more minutes. The advocate types the minutes, the price per minute comes from the backend, the client
// confirms the payment in Telegram (the meeting is held until then; the request expires after 5 minutes).
export function ExtendSheet({ visible, onClose, price, busy, onAsk }: { visible: boolean; onClose: () => void; price: number; busy: boolean; onAsk: (minutes: number) => void }) {
  const { t } = useT();
  const f = useAppForm(extendSchema, { min: "10" });
  const min = Number(f.watch("min")) || 0;
  // Steppers and presets stay inside 1..MAX; typed text is checked on submit.
  const set = (n: number) => f.setValue("min", String(Math.min(MAX_MINUTES, Math.max(1, Math.round(n) || 1))), { shouldValidate: true });
  const submit = f.handleSubmit((v) => { onAsk(Number(v.min)); onClose(); });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admMeetB.extendPaid")} subtitle={t("admMeetB.pricePerMin", { price: fmtMoney(price) })} onSubmit={() => void submit()} submitLabel={t("admMeet.askPayment")} submitting={busy} snaps={[0.55, 0.75]}>
      <View style={s.step}>
        <IconButton icon="minus" onPress={() => set(min - 1)} />
        <View style={s.input}><FormInput control={f.control} name="min" label={t("ms6.minutes")} format={(v) => v.replace(/\D/g, "")} keyboardType="number-pad" maxLength={3} /></View>
        <IconButton icon="plus" onPress={() => set(min + 1)} />
      </View>
      <View style={s.row}>{PRESETS.map((m) => <Chip key={m} label={t("admMeet.minutes", { n: m })} active={m === min} onPress={() => set(m)} />)}</View>
      <Text variant="h4">{t("admMeetB.total", { amount: fmtMoney(min * price) })}</Text>
      <Text variant="caption" tone="gray">{t("admMeetB.paidNote")}</Text>
    </FormSheet>
  );
}

const s = StyleSheet.create({ step: { flexDirection: "row", alignItems: "flex-end", gap: 10 }, input: { flex: 1 }, row: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
