import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { openUrl } from "@/shared/lib/links";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { assistRoute, canDecline, type AssistInfo } from "@/entities/support";
import { useAssistActions } from "@/features/support";

type Props = { card: AssistInfo; onClose: () => void };

// Buttons of the sheet. "Open …" shows the real object (the server's truth); the only writes are the
// Telegram link and declining an unpaid marketplace order. Payment itself is approved in Telegram.
export function AssistActions({ card, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const act = useAssistActions(card);
  const go = (path: string) => { onClose(); router.push(path as never); };
  const pending = card.pay === "pending";
  return (
    <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
      {pending && card.telegramSent === false ? <Button title={t("sp7.linkTelegram")} variant="soft" icon="send" full loading={act.busy === "link"} onPress={() => void act.linkTelegram()} /> : null}
      {pending && card.telegramSent !== false ? <Button title={t("sp7.openTelegram")} variant="soft" icon="send" full onPress={() => openUrl("tg://")} /> : null}
      <Button title={t(`sp7.open.${card.kind}`)} variant="gradient" icon="arrow-right" iconRight full onPress={() => go(assistRoute(card))} />
      <View style={s.row}>
        <Button title={t("sp7.openChat")} variant="line" icon="message-circle" onPress={() => go(`/support/${encodeURIComponent(card.ticketId)}`)} style={s.fill} />
        <Button title={t("sp7.later")} variant="line" onPress={onClose} style={s.fill} />
      </View>
      {canDecline(card) ? <Button title={t("sp7.decline")} variant="ghost" icon="x-circle" full loading={act.busy === "decline"} onPress={act.decline} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { gap: 10, paddingHorizontal: 18, paddingTop: 10, borderTopWidth: 1 },
  row: { flexDirection: "row", gap: 10 },
  fill: { flex: 1 },
});
