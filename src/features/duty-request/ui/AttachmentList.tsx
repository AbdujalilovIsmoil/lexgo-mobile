import { StyleSheet, View } from "react-native";
import { Icon, IconButton, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { Attach } from "@/entities/duty-request";
import { VoiceItem } from "./VoiceItem";

const mb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

type Props = { files: Attach[]; voices: Attach[]; onRemoveFile: (i: number) => void; onRemoveVoice: (i: number) => void };

// What will be sent with the request: documents (name + size) and playable voice notes.
export function AttachmentList({ files, voices, onRemoveFile, onRemoveVoice }: Props) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={{ gap: 8 }}>
      {files.map((f, i) => (
        <View key={`${f.uri}-${i}`} style={[s.row, { backgroundColor: c.surface2 }]}>
          <Icon name={/^image\//.test(f.mime) ? "image" : "file-text"} size={20} color={c.accent} />
          <View style={{ flex: 1 }}>
            <Text variant="small" weight="semibold" numberOfLines={1}>{f.name}</Text>
            <Text variant="caption" tone="gray">{mb(f.size)}</Text>
          </View>
          <IconButton icon="x" size={32} onPress={() => onRemoveFile(i)} label={t("dm8.remove")} />
        </View>
      ))}
      {voices.map((v, i) => <VoiceItem key={v.uri} uri={v.uri} label={t("dm8.voiceItem", { n: i + 1 })} onRemove={() => onRemoveVoice(i)} />)}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 16 } });
