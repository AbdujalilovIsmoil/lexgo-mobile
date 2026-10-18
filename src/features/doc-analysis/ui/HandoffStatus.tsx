import { StyleSheet, View } from "react-native";
import { phaseOf, type DocRequestState, type HandoffResult } from "@/entities/doc-analysis";
import { useColors } from "@/shared/theme";
import { Card, Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";

type Props = { sent: HandoffResult; live: DocRequestState | null };

// What happened to the handed-over review. While the fee waits for approval over
// Telegram nothing has reached an advocate — this card says exactly that, and updates by itself.
export function HandoffStatus({ sent, live }: Props) {
  const c = useColors();
  const { t } = useT();
  const gate = live?.gate ?? sent.gate;
  const src = live ?? { status: sent.status, paymentRequired: sent.paymentRequired, gate: sent.gate };
  const kind = sent.alreadyExists ? "already" : sent.paymentRequired && !live ? "wait" : phaseOf(src);
  const wait = kind === "wait";
  const tint = kind === "sent" ? c.ok : kind === "stopped" ? c.err : c.warn;
  return (
    <Card tinted style={s.card}>
      <View style={s.head}>
        <Icon name={kind === "sent" ? "check-circle" : kind === "stopped" ? "x-circle" : "clock"} size={22} color={tint} />
        <Text variant="h4" style={s.flex}>{t(`dc9.${kind}.title`)}</Text>
      </View>
      <Text variant="small" tone="gray">{sent.alreadyExists && sent.message ? sent.message : t(`dc9.${kind}.text`)}</Text>
      {wait && gate ? (
        <View style={s.pills}>
          <Pill label={`${fmtMoney(gate.amount)} ${t("common.currency")}`} tone="warn" small />
          <Pill label={t("docs.pages", { n: gate.pageCount })} tone="gray" small />
          {gate.extraPages ? <Pill label={t("dc8.q.extra", { n: gate.extraPages })} tone="gray" small /> : null}
          {gate.telegramSent ? null : <Pill label={t("dc9.noTelegram")} tone="err" small />}
        </View>
      ) : null}
      {sent.workId ? <Pill label={sent.workId} tone="blue" small icon="hash" /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
