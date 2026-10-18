import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { kindOf, type FileKind } from "@/shared/lib/download";
import { useColors } from "@/shared/theme";
import type { DocFile } from "@/entities/doc-queue";

const ICON: Record<FileKind, IconName> = { image: "image", pdf: "file-text", office: "file-text", audio: "mic", video: "video", text: "file", other: "paperclip" };
const size = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : n ? `${n} B` : "");

// A file of the request: tap to preview it in the app (PDF / image / audio / Office on iOS).
export function FileRow({ file, onPress }: { file: DocFile; onPress: () => void }) {
  const c = useColors();
  const sub = [file.note, size(file.size)].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onPress} style={[s.row, { backgroundColor: c.surface2 }]}>
      <Icon name={ICON[kindOf(file.name, file.mime)]} size={19} color={c.accent} />
      <View style={{ flex: 1 }}>
        <Text variant="small" weight="semibold" numberOfLines={1}>{file.name}</Text>
        {sub ? <Text variant="caption" tone="gray" numberOfLines={1}>{sub}</Text> : null}
      </View>
      <Icon name="eye" size={17} tone="gray" />
    </PressableScale>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14 } });
