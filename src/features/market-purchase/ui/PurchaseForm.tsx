import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, Text } from "@/shared/ui";
import { FormInput } from "@/shared/form";
import { OptionSections, QuotePanel } from "@/entities/price-option";
import { useT } from "@/shared/i18n";
import { NOTE_MAX, type PurchaseState } from "../model/usePurchase";
import { ChannelPick } from "./ChannelPick";

type P = PurchaseState;
const QUICK = ["today", "evening", "tomorrow", "week"] as const;

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return <View style={s.sec}><Text variant="small" weight="bold" tone="gray">{`${n} · ${title}`}</Text>{children}</View>;
}

// The request form as three numbered steps (how to talk · what happened · when) and the price breakdown. With `bare` the
// submit button is left out: the checkout pins its own bar at the bottom of the sheet.
export function PurchaseForm({ p, blocked, bare }: { p: P; blocked: string; bare?: boolean }) {
  const { t } = useT();
  const f = p.form;
  const time = f.watch("time");
  const quick = (k: string) => { const v = t(`mk3.quick.${k}`); f.setValue("time", time === v ? "" : v, { shouldValidate: true }); };
  return (
    <View style={s.col}>
      <Section n={1} title={t("mk3.channelShort")}><ChannelPick value={p.channel} onChange={p.setChannel} /></Section>
      <Section n={2} title={t("mk3.note")}>
        <FormInput control={f.control} name="note" placeholder={t("mk3.notePh")} multiline numberOfLines={4} maxLength={NOTE_MAX} style={s.area} hint={`${f.watch("note").length}/${NOTE_MAX}`} />
      </Section>
      <Section n={3} title={t("mk3.time")}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} keyboardShouldPersistTaps="handled">
          {QUICK.map((k) => <Chip key={k} label={t(`mk3.quick.${k}`)} active={time === t(`mk3.quick.${k}`)} onPress={() => quick(k)} />)}
        </ScrollView>
        <FormInput control={f.control} name="time" placeholder={t("mk3.timePh")} maxLength={120} />
      </Section>
      <OptionSections sections={p.options.data?.sections ?? []} ids={p.q.ids} onToggle={p.q.toggle} disabled={p.sending} />
      <QuotePanel quote={p.q.quote} pending={p.q.pending} error={p.q.error} onRetry={p.q.retry} />
      <Text variant="caption" tone="gray">{t("mk3.totalNote")}</Text>
      {p.error ? <Text variant="small" tone="err">{p.error}</Text> : null}
      {blocked ? <Text variant="small" tone="warn">{blocked}</Text> : null}
      {bare ? null : <Button title={p.sending ? t("mk3.sending") : t("mk3.submit")} onPress={() => void p.submit()} loading={p.sending} disabled={!!blocked || !p.q.settled} variant="gradient" size="lg" icon="send" full />}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 20 },
  sec: { gap: 10 },
  row: { gap: 8 },
  area: { minHeight: 104, textAlignVertical: "top" },
});
