import { StyleSheet, View } from "react-native";
import { QuoteRows } from "@/entities/doc-analysis";
import { Button, Card, Input, Skeleton, Text } from "@/shared/ui";
import { SwitchField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { useHandoff } from "../model/useHandoff";
import { HandoffStatus } from "./HandoffStatus";

// Offer under the result: server price for the measured pages, options, send.
export function HandoffCard({ h }: { h: ReturnType<typeof useHandoff> }) {
  const { t } = useT();
  if (h.sent) return <HandoffStatus sent={h.sent} live={h.state} />;
  return (
    <Card tinted style={s.card}>
      <Text variant="h4">{t("docs.lawyer")}</Text>
      <Text variant="small" tone="gray">{t("dc9.offer")}</Text>
      {h.quote.data ? <QuoteRows quote={h.quote.data} /> : h.quote.isError ? <Text variant="small" tone="err">{t("dc9.quoteFailed")}</Text> : <View style={s.sk}><Skeleton height={40} /><Skeleton height={40} /></View>}
      <SwitchField label={t("dc9.urgent")} hint={t("dc9.urgentHint")} value={h.urgent} onChange={h.setUrgent} />
      <Input label={t("dc9.noteLabel")} value={h.note} onChangeText={h.setNote} placeholder={t("docs.need")} multiline style={s.ta} />
      <Button title={t("docs.send")} icon="send" variant="gradient" full onPress={() => h.send.mutate()} loading={h.send.isPending} disabled={!h.quote.data} />
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 10 }, sk: { gap: 6 }, ta: { minHeight: 72, textAlignVertical: "top" } });
