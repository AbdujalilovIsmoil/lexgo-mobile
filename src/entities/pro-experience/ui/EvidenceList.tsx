import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { FilePreview, type FileRef } from "@/shared/ui/preview";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { ExpEvidence } from "../model/types";

export type EvidenceRow = { key: string; name: string; busy?: boolean; file: FileRef | null };

// A supporting file as the viewer opens it: downloaded from GET /marketplace/experience/evidence/{id} with the seller's token (only the
// owner and the reviewers may read it). Without a known name the file's own name decides how it is shown.
export const evidenceFile = (e: ExpEvidence): FileRef | null => (e.downloadUrl ? { path: e.downloadUrl, name: e.fileName || undefined, mime: e.mime || undefined } : null);

// The files of an entry: a tap opens one in the app's viewer (above the sheet it is drawn in); `onRemove` adds an × for the form.
export function EvidenceList({ rows, onRemove }: { rows: EvidenceRow[]; onRemove?: (key: string) => void }) {
  const { t } = useT();
  const c = useColors();
  const [open, setOpen] = useState<FileRef | null>(null);
  if (!rows.length) return null;
  return (
    <View style={s.col}>
      {rows.map((r) => (
        <View key={r.key} style={[s.row, { backgroundColor: c.surface2 }]}>
          <PressableScale onPress={() => r.file && setOpen(r.file)} disabled={!r.file || r.busy} accessibilityRole="button" accessibilityLabel={t("pxp.ev.open", { name: r.name })} style={s.open}>
            <Icon name={r.busy ? "loader" : "paperclip"} size={16} tone="gray" />
            <Text variant="small" numberOfLines={1} style={s.flex}>{r.name}</Text>
          </PressableScale>
          {onRemove ? (
            <PressableScale onPress={() => onRemove(r.key)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("pxp.ev.remove", { name: r.name })}>
              <Icon name="x" size={18} tone="gray" />
            </PressableScale>
          ) : null}
        </View>
      ))}
      <FilePreview visible={!!open} onClose={() => setOpen(null)} file={open} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingRight: 12, borderRadius: 14 },
  open: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44, paddingLeft: 12, paddingVertical: 10 },
  flex: { flex: 1 },
});
