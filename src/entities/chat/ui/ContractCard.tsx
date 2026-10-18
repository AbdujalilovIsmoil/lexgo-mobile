import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { aiTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { FilePreview } from "@/shared/ui/preview";
import { useT } from "@/shared/i18n";
import type { Contract } from "../model/types";

// A generated contract attached to an answer; opens in the in-app viewer (authed GET /contracts/{id}/file).
export function ContractCard({ contract: c }: { contract: Contract }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const path = c.id ? `/contracts/${c.id}/file` : c.downloadUrl;
  const name = c.fileName || `${c.contractType || "contract"}.pdf`;
  return (
    <>
      <PressableScale onPress={() => setOpen(true)} disabled={!path} style={s.card} accessibilityRole="button" accessibilityLabel={t("ax1.openContract")}>
        <View style={s.icon}><Icon name="file-text" size={18} color={aiTheme.accent} /></View>
        <View style={s.col}>
          <Text variant="small" weight="semibold" numberOfLines={1} style={{ color: aiTheme.text }}>{c.contractType || name}</Text>
          <Text variant="caption" style={{ color: aiTheme.muted }}>{[c.status, t("ax1.openContract")].filter(Boolean).join(" · ")}</Text>
        </View>
        <Icon name="chevron-right" size={18} color={aiTheme.muted} />
      </PressableScale>
      <FilePreview visible={open} onClose={() => setOpen(false)} file={path ? { path, name, mime: c.mimeType } : null} />
    </>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 16, borderWidth: 1, borderColor: aiTheme.border, backgroundColor: aiTheme.glass, marginTop: 4 },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(95,217,255,0.14)" },
  col: { flex: 1, gap: 1 },
});
