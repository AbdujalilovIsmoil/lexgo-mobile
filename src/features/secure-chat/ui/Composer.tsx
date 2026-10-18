import { useState } from "react";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { Linking, StyleSheet, View } from "react-native";
import { ActionList } from "@/shared/ui/admin";
import { Icon, PressableScale, Text, confirmDialog, toast } from "@/shared/ui";
import { ReplyQuote, type Msg, type PickedFile } from "@/entities/secure-chat";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { useAttach, type AttachKind } from "../model/useAttach";
import { useDraft } from "../model/useDraft";
import { useVoiceRecorder } from "../model/useVoiceRecorder";
import { EmojiSheet } from "./EmojiSheet";
import { TextBar } from "./TextBar";
import { VoiceBar } from "./VoiceBar";

type Props = { roomId: string; onSend: (text: string) => void; onFile: (f: PickedFile, type: "file" | "voice") => void; reply: Msg | null; onClearReply: () => void; closed?: string };

// Message box: reply strip, text / emoji / attachments / voice, and the sheets they open. A closed room
// (consultation completed, chat archived) shows the reason instead of an input.
export function Composer({ roomId, onSend, onFile, reply, onClearReply, closed }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const { progress } = useReanimatedKeyboardAnimation();
  const pad = useAnimatedStyle(() => ({ paddingBottom: interpolate(progress.value, [0, 1], [insets.bottom + 8, 8]) }));
  const [text, setText] = useDraft(roomId);
  const [menu, setMenu] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const voice = useVoiceRecorder();
  const attach = useAttach((f) => onFile(f, "file"));
  const pick = (k: AttachKind, label: string, icon: "image" | "camera" | "file") => ({ key: k, label, icon, onPress: () => void attach(k) });
  const record = async () => {
    const r = await voice.start();
    if (r === "denied") confirmDialog({ title: t("ms3.micDenied"), message: t("ms3.micDeniedText"), confirmLabel: t("admMeetB.settings"), cancelLabel: t("adm.cancel"), icon: "mic-off", onConfirm: () => void Linking.openSettings() });
    else if (r === "failed") toast(t("ms3.recordFailed"), "err");
  };
  const stop = async () => { const r = await voice.stop(); if (r === "short") toast(t("ms3.tooShort"), "info"); else if (r === "failed") toast(t("ms3.recordFailed"), "err"); };
  const sendClip = () => { if (voice.clip) onFile(voice.clip, "voice"); voice.done(); };
  if (closed) return <View style={[s.closed, { backgroundColor: c.surface2, paddingBottom: insets.bottom + 12 }]}><Icon name="lock" size={16} tone="gray" /><Text variant="small" tone="gray" style={s.flex}>{closed}</Text></View>;
  return (
    <Animated.View style={[s.bar, { backgroundColor: c.bg, borderTopColor: c.line }, pad]}>
      {reply ? <View style={s.reply}><View style={s.flex}><ReplyQuote reply={{ id: reply.id, sender: reply.sender, type: reply.type, content: reply.content }} /></View><PressableScale onPress={onClearReply} hitSlop={10}><Icon name="x" size={18} tone="gray" /></PressableScale></View> : null}
      {voice.phase === "idle" ? <View style={s.safe}><Icon name="lock" size={12} color={c.gray2} /><Text variant="caption" tone="gray2" style={s.flex}>{t("scx.safety")}</Text></View> : null}
      {voice.phase === "idle" ? <TextBar text={text} onChange={setText} onSend={() => { onSend(text); setText(""); }} onAttach={() => setMenu(true)} onEmoji={() => setEmoji(true)} onMic={() => void record()} /> : <VoiceBar voice={voice} onStop={() => void stop()} onSend={sendClip} />}
      <ActionList visible={menu} onClose={() => setMenu(false)} title={t("admChat.attach")} actions={[pick("photo", t("admChat.photo"), "image"), pick("camera", t("admChat.camera"), "camera"), pick("file", t("admChat.file"), "file")]} />
      <EmojiSheet visible={emoji} onClose={() => setEmoji(false)} onPick={(e) => setText(text + e)} />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  bar: { paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, gap: 6 },
  reply: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  safe: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 },
  closed: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 12 },
});
