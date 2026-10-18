import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Icon, Pill, PressableScale, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { kindOf, type FileKind } from "@/shared/lib/download";
import type { DocFile, FileEntry } from "@/entities/doc-queue";

const ICON: Record<FileKind, IconName> = { image: "image", pdf: "file-text", office: "file-text", audio: "mic", video: "video", text: "file", other: "paperclip" };
const TONE = { final: "ok", client: "blue", template: "gray" } as const;
export const sizeText = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : n ? `${n} B` : "");

// The request's files as rows: type tile, name, role chip + size, and a download icon (a spinner while that one is fetched).
export function DocSheetFiles({ files, busy, onPick }: { files: FileEntry[]; busy: string; onPick: (f: DocFile) => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.col}>
      {files.map(({ file, role }) => {
        const size = sizeText(file.size);
        return (
          <PressableScale key={`${role}-${file.id}`} onPress={() => onPick(file)} disabled={!!busy} accessibilityRole="button" accessibilityLabel={`${t("proDocSheet.download")}: ${file.name}`} style={[s.row, { backgroundColor: c.surface, borderColor: c.line, opacity: busy && busy !== file.id ? 0.55 : 1 }]}>
            <View style={[s.tile, { backgroundColor: c.tint2 }]}><Icon name={ICON[kindOf(file.name, file.mime)]} size={19} color={c.accent} /></View>
            <View style={s.flex}>
              <Text variant="small" weight="semibold" numberOfLines={1}>{file.name}</Text>
              <View style={s.meta}>
                <Pill label={t(`proDocSheet.role.${role}`)} tone={TONE[role]} small />
                {size ? <Text variant="caption" tone="gray">{size}</Text> : null}
              </View>
            </View>
            {busy === file.id ? <ActivityIndicator color={c.accent} /> : <Icon name="download" size={18} tone="gray" />}
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, padding: 10, borderRadius: radius.r, borderWidth: 1 },
  tile: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
  flex: { flex: 1 },
});
