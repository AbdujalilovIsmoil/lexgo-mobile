import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtTime } from "@/shared/lib/format";
import { gradient, useColors } from "@/shared/theme";
import { maskContacts } from "../lib/maskContacts";
import { callIdOf } from "../model/preview";
import { HIDDEN, type Msg } from "../model/types";
import { Attachment, type OpenFile } from "./Attachment";
import { Meta, SenderLine } from "./BubbleParts";
import { CallNote } from "./CallNote";
import { Notice } from "./Notice";
import { ReplyQuote } from "./ReplyQuote";
import { SwipeReply } from "./SwipeReply";

type Props = { msg: Msg; mine: boolean; group: boolean; flash?: boolean; canReply: boolean; live?: Set<string>; onMenu: (m: Msg) => void; onReply: (m: Msg) => void; onCall: (callId: string) => void; onJump: (id: string) => void; onOpen: (f: OpenFile) => void };

// One chat message: my bubble on the brand gradient, theirs on the surface with "Name  ROLE" above it (as on the web),
// or a call card / system note.
export function MessageBubble({ msg, mine, group, flash, canReply, live, onMenu, onReply, onCall, onJump, onOpen }: Props) {
  const { t } = useT();
  const c = useColors();
  if (msg.type === "system" || msg.type === "result") return <Notice msg={msg} />;
  const callId = callIdOf(msg.content);
  if (msg.type === "meeting" || msg.type === "call" || callId) return <CallNote msg={msg} callId={callId} live={!live || live.has(callId)} onJoin={onCall} />;
  const fg = mine ? "#FFFFFF" : c.ink;
  const hidden = msg.content === HIDDEN;
  const showText = !!msg.content && !(msg.file && (msg.content === msg.file.name || msg.type === "voice"));
  return (
    <SwipeReply enabled={canReply} onReply={() => onReply(msg)}>
      <View style={[s.row, mine && s.mine]}>
        {!mine && group ? <Avatar name={msg.sender?.name || "?"} size={28} /> : null}
        <View style={s.stack}>
          {!mine && msg.sender?.name ? <SenderLine msg={msg} /> : null}
        <PressableScale scale={0.99} haptic={false} onLongPress={() => onMenu(msg)} onPress={msg.failed ? () => onMenu(msg) : undefined} accessible accessibilityLabel={[mine ? "" : msg.sender?.name, hidden ? t("admChat.hiddenText") : msg.content || msg.file?.name, fmtTime(msg.createdAt)].filter(Boolean).join(", ")} accessibilityHint={t("a11y.msgHint")} accessibilityActions={[{ name: "longpress", label: t("a11y.actions") }]} onAccessibilityAction={() => onMenu(msg)} style={[s.bubble, { backgroundColor: mine ? "transparent" : c.surface2 }, mine ? s.tailMine : s.tailThem, msg.failed && { borderColor: c.err, borderWidth: 1.5 }, flash && { borderColor: c.ok, borderWidth: 2 }]}>
          {mine ? <LinearGradient colors={[...gradient.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fill} pointerEvents="none" /> : null}
          <View style={s.gap}>
            {msg.reply ? <ReplyQuote reply={msg.reply} mine={mine} onPress={() => onJump(msg.reply?.id ?? "")} /> : null}
            {msg.file ? <Attachment msg={msg} fg={fg} onOpen={onOpen} /> : null}
            {hidden ? <View style={s.hidden}><Icon name="lock" size={14} color={fg} /><Text variant="small" style={{ color: fg, fontStyle: "italic" }}>{t("admChat.hiddenText")}</Text></View> : showText ? <Text variant="body" style={{ color: fg }}>{maskContacts(msg.content)}</Text> : null}
            {msg.blocked ? <Text variant="caption" style={{ color: mine ? "#FFE0E0" : c.err }}>{msg.blockReason || t("admChat.blocked")}</Text> : null}
            <Meta msg={msg} mine={mine} fg={fg} />
          </View>
        </PressableScale>
        </View>
      </View>
    </SwipeReply>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginVertical: 5 },
  mine: { justifyContent: "flex-end" },
  gap: { gap: 4 },
  stack: { maxWidth: "80%", gap: 3, flexShrink: 1 },
  fill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  bubble: { borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14, overflow: "hidden" },
  tailMine: { borderBottomRightRadius: 5 },
  tailThem: { borderBottomLeftRadius: 5 },
  hidden: { flexDirection: "row", alignItems: "center", gap: 6 },
});
