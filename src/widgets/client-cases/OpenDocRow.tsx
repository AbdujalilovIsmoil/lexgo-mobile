import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/shared/theme";
import { Button, Card, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { StatusBadge, chatPath, docPath, useDocChat, type DocRow } from "@/entities/my-document";
import { useWorkText } from "@/entities/work";

// One unfinished document request: status, advocate, next step, and the chat once an advocate took it.
export function OpenDocRow({ doc }: { doc: DocRow }) {
  const c = useColors();
  const { t, locale } = useT();
  const router = useRouter();
  const text = useWorkText();
  const held = doc.mode === "lawyer" || doc.lawyerActive || !!doc.lawyer;
  const chat = useDocChat(doc.id, held);
  const room = chat.data?.available ? chat.data.roomId : "";
  const sub = [doc.lawyer, doc.createdAt ? fmtDateTime(doc.createdAt, locale) : ""].filter(Boolean).join(" · ");
  return (
    <Card onPress={() => router.push(docPath(doc.id) as never)} style={s.card}>
      <View style={s.head}><Text variant="body" weight="bold" numberOfLines={2} style={s.flex}>{doc.title || t("ccs.open.openTitle")}</Text><StatusBadge status={doc.status} label={doc.statusLabel} /></View>
      {sub ? <Text variant="caption" tone="gray">{sub}</Text> : null}
      {doc.nextAction ? <Text variant="small" tone="accent">{text.next(doc.nextAction)}</Text> : null}
      {doc.meeting ? <View style={s.live}><Icon name="video" size={13} color={c.ok} /><Text variant="caption" tone="ok">{t("ccs.open.meetingActive")}</Text></View> : null}
      {room ? <Button title={t("ccs.open.openChat")} icon="message-circle" size="sm" onPress={() => router.push(chatPath(room) as never)} /> : held ? <View style={s.live}><Icon name="clock" size={13} tone="gray" /><Text variant="caption" tone="gray">{t("ccs.open.waitingLawyer")}</Text></View> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 8, padding: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  live: { flexDirection: "row", alignItems: "center", gap: 6 },
});
