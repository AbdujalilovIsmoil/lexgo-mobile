import { StyleSheet, View } from "react-native";
import { SORTS, TYPES, type Section, type TypeFilter } from "@/entities/pro-files";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { brand, useColors } from "@/shared/theme";
import { BottomSheet, Button, Chip, Icon, IconButton, PressableScale, SheetScroll, Text, type IconName } from "@/shared/ui";
import { Segmented } from "@/shared/ui";
import type { FileFilters } from "./useFileFilters";

const DOT: Record<TypeFilter, string | undefined> = { all: undefined, folder: "#F0A93B", pdf: "#E05257", doc: "#2F7DE1", sheet: "#13996A", image: "#8460F0", file: "#37899A" };
const SEC_ICON: Record<Section, IconName> = { all: "folder", recent: "clock", starred: "star", requests: "inbox" };

type Props = { f: FileFilters; section: Section; sections: Section[]; onSection: (s: Section) => void; counts: Record<TypeFilter, number>; visible: boolean; onClose: () => void };

// Everything that narrows the page, in one sheet: the section (tiles), the file type (chips in the folder colours) and the sort order;
// a pinned "reset" + "show N" bar. Type and sort do not apply to the document requests list, so they are hidden there.
export function FileFilterSheet({ f, section, sections, onSection, counts, visible, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const files = section !== "requests";
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm11.filters")} snaps={[files ? 0.66 : 0.46, 0.92]}>
      <View style={s.flex}>
        <SheetScroll contentContainerStyle={s.body}>
          <View style={s.group}>
            <Text variant="small" weight="bold" tone="gray">{t("aw8.secLabel")}</Text>
            <View style={s.tiles}>
              {sections.map((k) => {
                const on = section === k;
                return (
                  <PressableScale key={k} onPress={() => onSection(k)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.tile, { backgroundColor: on ? brand.b600 : c.surface2, borderColor: on ? brand.b600 : c.line }]}>
                    <Icon name={SEC_ICON[k]} size={18} color={on ? "#FFFFFF" : c.accent} />
                    <Text variant="small" weight="bold" style={{ color: on ? "#FFFFFF" : c.ink }}>{t(`aw8.sec.${k}`)}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
          {files ? (
            <>
              <View style={s.group}>
                <Text variant="small" weight="bold" tone="gray">{t("aw8.fType")}</Text>
                <View style={s.chips}>
                  {TYPES.filter((k) => k === "all" || k === f.type || counts[k] > 0).map((k) => <Chip key={k} label={`${t(`aw8.type.${k}`)} · ${counts[k]}`} active={f.type === k} color={DOT[k]} onPress={() => f.setType(k)} />)}
                </View>
              </View>
              <View style={s.group}>
                <Text variant="small" weight="bold" tone="gray">{t("aw8.sortBy")}</Text>
                <Segmented options={SORTS.map((k) => ({ value: k, label: t(`aw8.sort.${k}`) }))} value={f.sort} onChange={f.setSort} />
              </View>
            </>
          ) : null}
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("pwc.filter.reset")} onPress={() => { f.reset(); onSection("all"); }} />
          <Button title={files ? `${t("dm11.fShow")} · ${counts[f.type]}` : t("aw8.done")} variant="gradient" full style={s.flex} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingTop: 24, gap: 24 },
  group: { gap: 10 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48.5%", flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, minHeight: 54, borderRadius: 16, borderWidth: 1.5 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
});
