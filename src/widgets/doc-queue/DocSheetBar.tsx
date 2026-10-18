import { StyleSheet, View } from "react-native";
import { Button, Icon, IconButton, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import type { SheetAction } from "@/entities/doc-queue";

type Props = { hasFile: boolean; action: SheetAction; busy: boolean; acting: boolean; onDownload: () => void; onAction: () => void; onDetail: () => void };
const ICON = { claim: "check-circle", editor: "edit-3", transfer: "repeat" } as const;

// Sticky bar of the request sheet, never more than three controls: the contextual action (outlined, compact, above),
// then a large «Yuklab olish» (disabled with a one-line reason when there is no file) and a round «Batafsil» icon.
export function DocSheetBar({ hasFile, action, busy, acting, onDownload, onAction, onDetail }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  return (
    <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 12 }]}>
      {!hasFile ? (
        <View style={s.reason} accessibilityLiveRegion="polite">
          <Icon name="info" size={15} color={c.gray} />
          <Text variant="caption" tone="gray" numberOfLines={1} style={s.flex}>{t("proDocSheet.noFile")}</Text>
        </View>
      ) : null}
      {action ? <Button title={t(`proDocSheet.act.${action}`)} icon={ICON[action]} variant="line" size="sm" loading={acting} onPress={onAction} style={s.act} full /> : null}
      <View style={s.row}>
        <Button title={t("proDocSheet.download")} icon="download" variant="gradient" loading={busy} disabled={!hasFile} onPress={onDownload} style={s.main} full />
        <IconButton icon="arrow-up-right" size={52} label={t("proDocSheet.detail")} onPress={onDetail} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { gap: 10, paddingTop: 12, paddingHorizontal: 18, borderTopWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  reason: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  act: { minHeight: 44 },
  main: { flex: 1, minHeight: 52 },
});
