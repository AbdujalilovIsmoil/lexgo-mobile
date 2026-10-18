import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SCAN_FORMATS, type ScanFormat } from "@/shared/lib/scan/formats";
import { OCR_LANGS, type OcrLang } from "@/shared/lib/scan/ocr";
import { ocrAvailable } from "../model/recognize";
import { useT } from "@/shared/i18n";
import { brand, useColors } from "@/shared/theme";
import { BottomSheet, Button, Icon, Input, PressableScale, SheetScroll, Text, type IconName } from "@/shared/ui";

const ICON: Record<ScanFormat, IconName> = { pdf: "file-text", docx: "file", jpg: "image", png: "image" };
type Props = { visible: boolean; onClose: () => void; pages: number; name: string; onName: (v: string) => void; busy: boolean; error?: string; folder: string; onUpload: (f: ScanFormat, ocr: OcrLang[]) => void; onShare: (f: ScanFormat, ocr: OcrLang[]) => void };
const LANG_KEY: Record<OcrLang, string> = { uz: "scn.lUz", "uz-cyrl": "scn.lUzCyrl", ru: "scn.lRu", en: "scn.lEn" };

// Name, format (PDF · Word · JPG · PNG), the languages to read the text in (PDF and Word only) and what to do with the result:
// upload into the workspace folder or save / share from the phone.
export function ExportSheet({ visible, onClose, pages, name, onName, busy, error, folder, onUpload, onShare }: Props) {
  const { t } = useT();
  const c = useColors();
  const [format, setFormat] = useState<ScanFormat>("pdf");
  const [langs, setLangs] = useState<OcrLang[]>(["uz"]);
  const reads = ocrAvailable && (format === "pdf" || format === "docx");
  const ocr = reads ? langs : [];
  const toggle = (l: OcrLang) => setLangs((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]));
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
        {reads ? (
          <View style={s.langs}>
            <Text variant="small" weight="bold" tone="gray">{t("scn.ocrT")}</Text>
            <Text variant="caption" tone="gray">{langs.length ? t("scn.ocrX") : t("scn.ocrNone")}</Text>
            <View style={s.chips}>
              {OCR_LANGS.map((l) => {
                const on = langs.includes(l);
                return (
                  <PressableScale key={l} onPress={() => toggle(l)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={[s.chip, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? brand.b600 : c.line }]}>
                    <Text variant="small" weight="bold" tone={on ? "accent" : "gray"}>{t(LANG_KEY[l])}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        ) : null}
        {error ? <Text variant="small" weight="semibold" style={{ color: c.err }} accessibilityLiveRegion="polite">{error}</Text> : null}
        <Button title={busy ? t("scn.working") : t("scn.upload")} icon="upload-cloud" variant="gradient" full loading={busy} onPress={() => onUpload(format, ocr)} />
        <Button title={t("scn.share")} icon="share-2" variant="soft" full disabled={busy} onPress={() => onShare(format, ocr)} />
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { paddingTop: 20, gap: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  langs: { gap: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5 },
  tile: { width: "48.5%", gap: 4, padding: 14, borderRadius: 16, borderWidth: 1.5 },
});
