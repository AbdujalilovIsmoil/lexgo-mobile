import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Icon, IconButton, LevelBars, PressableScale, Text } from "@/shared/ui";
import { VoicePlayer } from "@/entities/secure-chat";
import { mmss } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import type { useVoiceRecorder } from "../model/useVoiceRecorder";

type Props = { voice: ReturnType<typeof useVoiceRecorder>; onStop: () => void; onSend: () => void };

// The composer while a voice message is being made: recording (timer, stop) → preview (play it back) → send.
export function VoiceBar({ voice, onStop, onSend }: Props) {
  const { t } = useT();
  const c = useColors();
  const preview = voice.phase === "preview" && voice.clip;
  const starting = voice.phase === "starting";
  return (
    <View style={s.row}>
      <IconButton icon="trash-2" onPress={voice.cancel} label={t("ms3.discard")} />
      <View style={[s.field, { backgroundColor: c.surface2 }]}>
        {preview ? <VoicePlayer uri={voice.clip?.uri ?? ""} seed="preview" fg={c.ink} /> : (
          <>
            <View style={[s.dot, { backgroundColor: c.err }]} />
            <Text variant="body" weight="semibold">{mmss(voice.ms)}</Text>
            <Text variant="small" tone="gray" style={s.hint} numberOfLines={1}>{starting ? t("vcx.starting") : t("ms3.recording")}</Text>
            <LevelBars color={c.err} count={7} height={22} live={!starting} />
          </>
        )}
      </View>
      <PressableScale onPress={preview ? onSend : onStop} disabled={starting} accessibilityLabel={preview ? t("ms3.send") : t("ms3.stop")} style={[s.btn, { backgroundColor: c.accent, opacity: starting ? 0.6 : 1 }]}>
        {starting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Icon name={preview ? "arrow-up" : "square"} size={preview ? 22 : 18} color="#FFFFFF" />}
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  field: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 22, paddingHorizontal: 14, minHeight: 48 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  hint: { flex: 1 },
  btn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
