import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { pickDocuments } from "@/shared/lib/upload";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, toast } from "@/shared/ui";
import type { AttachItem } from "../model/useAttachments";
import { useVoiceNote } from "../model/useVoiceNote";

type A = {
  items: AttachItem[];
  add: (kind: AttachItem["kind"], list: { uri: string; name: string; size?: number; durationMs?: number }[]) => number;
  remove: (key: string) => void;
  retry: (key: string) => void;
  room: { file: number; voice: number };
};

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

// Documents and a voice note for the specialist: two buttons (attach a file · record), the live recorder with stop / cancel, and the list
// of what is attached with its upload state (a failed one can be retried or removed).
export function AttachSection({ a, disabled }: { a: A; disabled?: boolean }) {
  const { t } = useT();
  const c = useColors();
  const voice = useVoiceNote((v) => { a.add("voice", [{ uri: v.uri, name: v.name, durationMs: v.durationMs }]); });
  const pick = async () => {
    const r = await pickDocuments({ multiple: true, maxMb: 25 }).catch(() => null);
    if (!r) return;
    if (r.error) return toast(t(r.error === "tooBig" ? "mk3.att.tooBig" : "mk3.att.badType"), "err");
    if (a.add("file", r.files) > 0) toast(t("mk3.att.limit", { n: 20 }), "info");
  };
  return (
    <View style={s.col}>
      {voice.recording ? (
        <View style={[s.rec, { backgroundColor: c.errBg }]}>
          <View style={[s.dot, { backgroundColor: c.err }]} />
          <Text variant="body" weight="bold" style={[s.flex, { color: c.err }]}>{t("mk3.att.recording", { time: mmss(voice.seconds) })}</Text>
          <PressableScale onPress={() => void voice.cancel()} accessibilityRole="button" accessibilityLabel={t("mk3.att.cancel")} style={[s.round, { backgroundColor: c.surface2 }]}><Icon name="x" size={18} tone="gray" /></PressableScale>
          <PressableScale onPress={() => void voice.stop()} accessibilityRole="button" accessibilityLabel={t("mk3.att.stop")} style={[s.round, { backgroundColor: c.err }]}><Icon name="check" size={18} color="#FFFFFF" /></PressableScale>
        </View>
      ) : (
        <View style={s.row}>
          <PressableScale onPress={() => void pick()} disabled={disabled || a.room.file <= 0} accessibilityRole="button" style={[s.btn, { borderColor: c.line, opacity: a.room.file <= 0 ? 0.5 : 1 }]}>
            <Icon name="paperclip" size={18} color={c.accent} />
            <Text variant="small" weight="bold" tone="accent">{t("mk3.att.file")}</Text>
          </PressableScale>
          <PressableScale onPress={() => void voice.start()} disabled={disabled || a.room.voice <= 0 || voice.starting} accessibilityRole="button" style={[s.btn, { borderColor: c.line, opacity: a.room.voice <= 0 ? 0.5 : 1 }]}>
            {voice.starting ? <ActivityIndicator size="small" color={c.accent} /> : <Icon name="mic" size={18} color={c.accent} />}
            <Text variant="small" weight="bold" tone="accent">{t("mk3.att.voice")}</Text>
          </PressableScale>
        </View>
      )}
      {voice.denied ? <Text variant="caption" tone="warn">{t("mk3.att.micDenied")}</Text> : null}
      {a.items.map((x) => (
        <View key={x.key} style={[s.item, { backgroundColor: c.surface2 }]}>
          <Icon name={x.kind === "voice" ? "mic" : "file"} size={17} color={x.state === "error" ? c.err : c.accent} />
          <View style={s.flex}>
            <Text variant="small" weight="semibold" numberOfLines={1}>{x.kind === "voice" ? t("mk3.att.voiceItem", { time: mmss(Math.round(x.durationMs / 1000)) }) : x.name}</Text>
            <Text variant="caption" tone={x.state === "error" ? "err" : "gray"}>{t(`mk3.att.state.${x.state}`)}</Text>
          </View>
          {x.state === "uploading" ? <ActivityIndicator size="small" color={c.accent} /> : null}
          {x.state === "error" ? <PressableScale onPress={() => a.retry(x.key)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("mk3.att.retry")}><Icon name="refresh-cw" size={17} color={c.accent} /></PressableScale> : null}
          <PressableScale onPress={() => a.remove(x.key)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("mk3.att.remove")}><Icon name="x" size={18} tone="gray" /></PressableScale>
        </View>
      ))}
      <Text variant="caption" tone="gray">{t("mk3.att.hint")}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: radius.r, borderWidth: 1, borderStyle: "dashed" },
  rec: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, paddingLeft: 14, borderRadius: radius.r },
  dot: { width: 10, height: 10, borderRadius: 5 },
  round: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: radius.r },
  flex: { flex: 1, minWidth: 0 },
});
