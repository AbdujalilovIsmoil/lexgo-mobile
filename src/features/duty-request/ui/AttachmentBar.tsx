import { Linking, View } from "react-native";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { LIMITS } from "@/entities/duty-request";
import { useVoiceRecorder } from "../model/useVoiceRecorder";
import type { useAttachments } from "../model/useAttachments";
import { AttachmentList } from "./AttachmentList";
import { AttachTile } from "./AttachTile";
import { VoiceLive } from "./VoiceLive";

type Props = { att: ReturnType<typeof useAttachments>; disabled?: boolean };

// "Add file / photo / voice note": three tiles (or the live recorder), the rule or the validation error, then what is attached.
export function AttachmentBar({ att, disabled }: Props) {
  const { t } = useT();
  const r = useVoiceRecorder(att.addVoice);
  const full = disabled || att.files.length >= LIMITS.maxFiles;
  const err = att.note ? t(`dm8.err.${att.note}`, { mb: att.rule.mb, n: LIMITS.maxFiles, types: att.rule.list }) : "";
  return (
    <View style={{ gap: 10 }}>
      {r.active ? <VoiceLive r={r} /> : (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <AttachTile icon="paperclip" label={t("dm8.addFile")} disabled={full} onPress={() => void att.pickFile()} />
          <AttachTile icon="image" label={t("dm8.addPhoto")} disabled={full} onPress={() => void att.pickPhoto()} />
          <AttachTile icon="mic" label={t("dm8.voice")} loading={r.busy} disabled={disabled || att.voices.length >= LIMITS.maxVoices} onPress={() => void r.start()} />
        </View>
      )}
      {r.denied ? <Text variant="caption" tone="err" onPress={() => void Linking.openSettings()}>{t("dm8.micDenied")}</Text> : null}
      {err ? <Text variant="caption" tone="err">{err}</Text> : <Text variant="caption" tone="gray2">{t("dm8.hint", { mb: att.rule.mb, types: att.rule.list })}</Text>}
      <AttachmentList files={att.files} voices={att.voices} onRemoveFile={att.removeFile} onRemoveVoice={att.removeVoice} />
    </View>
  );
}
