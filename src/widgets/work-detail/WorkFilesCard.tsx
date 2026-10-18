import { StyleSheet, View } from "react-native";
import type { WorkFile } from "@/entities/work";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { kindOf } from "@/shared/lib/download";

const ICON: Record<string, IconName> = { image: "image", pdf: "file-text", office: "file-text", audio: "mic", video: "video", text: "file", other: "paperclip" };
const mb = (n: number) => (n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

// Files of the work (the finished document and the client's uploads); tap to preview.
export function WorkFilesCard({ files, onOpen }: { files: WorkFile[]; onOpen: (f: WorkFile) => void }) {
  const c = useColors();
  const { t } = useT();
  if (!files.length) return null;
  return (
    <SectionCard title={t("cl4.files.title")}>
      {files.map((f) => (
        <PressableScale key={f.id} onPress={() => onOpen(f)} scale={0.985} style={[s.row, { borderColor: c.line }]}>
          <View style={[s.icon, { backgroundColor: c.tint2 }]}><Icon name={ICON[kindOf(f.name, f.mime)]} size={18} tone="accent" /></View>
          <View style={s.col}>
            <Text variant="small" weight="semibold" numberOfLines={2}>{f.name}</Text>
            <Text variant="caption" tone="gray2">{t(`cl4.files.${f.role}`)}{f.size ? ` · ${mb(f.size)}` : ""}</Text>
          </View>
          <Icon name="eye" size={18} tone="gray" />
        </PressableScale>
      ))}
    </SectionCard>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: radius.r, padding: 10 },
  icon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
});
