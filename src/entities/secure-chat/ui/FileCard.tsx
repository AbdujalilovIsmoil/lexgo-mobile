import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { kindOf, type FileKind } from "@/shared/lib/download";
import { useT } from "@/shared/i18n";
import { fmtSize } from "../lib/fmtSize";
import type { Msg } from "../model/types";

const ICON: Record<FileKind, IconName> = { image: "image", pdf: "file-text", office: "file", audio: "music", video: "film", text: "file-text", other: "paperclip" };

// A document inside a bubble: type icon, name, size — or the upload progress while it is being sent.
export function FileCard({ msg, fg, onOpen }: { msg: Msg; fg: string; onOpen: () => void }) {
  const { t } = useT();
  const f = msg.file;
  const pct = Math.round((msg.progress ?? 0) * 100);
  const sub = msg.failed ? t("admChat.sendFailed") : msg.pending ? (pct > 0 ? `${pct}%` : t("admChat.sending")) : fmtSize(f?.size ?? 0) || t("admChat.tapOpen");
  return (
    <PressableScale onPress={onOpen} disabled={msg.pending} style={s.row}>
      <View style={[s.icon, { backgroundColor: fg + "26" }]}>{msg.pending ? <ActivityIndicator color={fg} /> : <Icon name={ICON[kindOf(f?.name ?? "", f?.mime)]} size={20} color={fg} />}</View>
      <View style={s.col}>
        <Text variant="small" weight="semibold" style={{ color: fg }} numberOfLines={1}>{f?.name || t("admChat.fileMsg")}</Text>
        <Text variant="caption" style={{ color: fg, opacity: 0.8 }}>{sub}</Text>
        {msg.pending ? <View style={[s.track, { backgroundColor: fg + "33" }]}><View style={[s.fill, { width: `${Math.max(6, pct)}%`, backgroundColor: fg }]} /></View> : null}
      </View>
      {!msg.pending ? <Icon name="download" size={18} color={fg} /> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 210 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
  track: { height: 4, borderRadius: 2, marginTop: 3, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
});
