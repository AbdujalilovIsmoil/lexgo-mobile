import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SCAN_FORMATS, type ScanFormat } from "@/shared/lib/scan/formats";
import { useT } from "@/shared/i18n";
import { brand, useColors } from "@/shared/theme";
import { BottomSheet, Button, Icon, Input, PressableScale, SheetScroll, Text, type IconName } from "@/shared/ui";

const ICON: Record<ScanFormat, IconName> = { pdf: "file-text", docx: "file", jpg: "image", png: "image" };
type Props = { visible: boolean; onClose: () => void; pages: number; name: string; onName: (v: string) => void; busy: boolean; error?: string; folder: string; onUpload: (f: ScanFormat) => void; onShare: (f: ScanFormat) => void };

// Name, format (PDF · Word · JPG · PNG) and what to do with the result: upload into the workspace folder or save / share from the phone.
export function ExportSheet({ visible, onClose, pages, name, onName, busy, error, folder, onUpload, onShare }: Props) {
  const { t } = useT();
  const c = useColors();
  const [format, setFormat] = useState<ScanFormat>("pdf");
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("scn.exportT")} subtitle={`${t("scn.pages", { n: pages })} · ${folder}`} snaps={[0.8, 0.94]}>
      <SheetScroll contentContainerStyle={s.body}>
        <Input label={t("scn.name")} value={name} onChangeText={onName} autoCorrect={false} maxLength={80} />
        <Text variant="small" weight="bold" tone="gray">{t("scn.format")}</Text>
        <View style={s.grid}>
          {SCAN_FORMATS.map((f) => {
            const on = format === f;
            const key = f[0].toUpperCase() + f.slice(1);
            return (
              <PressableScale key={f} onPress={() => setFormat(f)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.tile, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? brand.b600 : c.line }]}>
                <Icon name={ICON[f]} size={20} tone={on ? "accent" : "gray"} />
                <Text weight="bold">{t(`scn.f${key}`)}</Text>
                <Text variant="caption" tone="gray" numberOfLines={2}>{t(`scn.h${key}`)}</Text>
              </PressableScale>
            );
          })}
        </View>
        {error ? <Text variant="small" weight="semibold" style={{ color: c.err }} accessibilityLiveRegion="polite">{error}</Text> : null}
        <Button title={busy ? t("scn.working") : t("scn.upload")} icon="upload-cloud" variant="gradient" full loading={busy} onPress={() => onUpload(format)} />
        <Button title={t("scn.share")} icon="share-2" variant="soft" full disabled={busy} onPress={() => onShare(format)} />
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { paddingTop: 20, gap: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48.5%", gap: 4, padding: 14, borderRadius: 16, borderWidth: 1.5 },
});
