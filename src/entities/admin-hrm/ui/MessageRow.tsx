import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { CcTicket } from "@/shared/ui/cc";
import { Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { timeAgo } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { Enter } from "./Enter";
import type { Message } from "../model/typesWork";

type Props = { item: Message; me: string; who: string; onPress: (item: Message) => void; index?: number };

// One direct message as an inbox row: avatar, sender, preview, time; unread ones get a blue strip and a dot.
export const MessageRow = memo(function MessageRow({ item, me, who, onPress, index }: Props) {
  const { t } = useT();
  const c = useColors();
  const out = item.senderId === me;
  const unread = !out && !item.readAt && item.status !== "read";
  const name = who || t("admHrm.colleague");
  return (
    <Enter index={index}>
    <CcTicket
      tint={unread ? c.accent : out ? "#8B5CF6" : c.line} avatar={name} title={out ? t("admHrm.msgTo", { name }) : name}
      subtitle={item.subject ? `${item.subject} — ${item.body}` : item.body} onPress={() => onPress(item)}
      badge={<View style={s.end}><Text variant="caption" tone="gray">{timeAgo(item.createdAt, t)}</Text>{unread ? <View style={[s.dot, { backgroundColor: c.accent }]} /> : null}</View>}
    />
    </Enter>
  );
});

const s = StyleSheet.create({ end: { alignItems: "flex-end", gap: 6 }, dot: { width: 10, height: 10, borderRadius: 5 } });
