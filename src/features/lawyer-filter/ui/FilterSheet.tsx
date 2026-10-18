import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { defaultLawyerFilters, useLawyerCount, type LawyerFilters } from "@/entities/lawyer";
import { BottomSheet, Button, IconButton, SheetScroll } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useLawyerFilterStore } from "../model/filterStore";
import { FilterOptions } from "./FilterOptions";

type Props = { visible: boolean; onClose: () => void };

// Filter drawer: edits a draft, shows the live result count, applies on tap.
// Drag the handle to resize or close it; tapping the dark area closes too.
export function FilterSheet({ visible, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const { filters, set } = useLawyerFilterStore();
  const [draft, setDraft] = useState<LawyerFilters>(filters);
  const [synced, setSynced] = useState(false);
  // Reset the draft to the applied filters each time the sheet opens.
  if (visible && !synced) {
    setSynced(true);
    setDraft(filters);
  } else if (!visible && synced) setSynced(false);
  const count = useLawyerCount({ ...draft, q: filters.q });
  const apply = () => {
    set({ ...draft });
    onClose();
  };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("flt.title")} snaps={[0.84, 0.94]}>
      <SheetScroll><FilterOptions draft={draft} set={(p) => setDraft((d) => ({ ...d, ...p }))} /></SheetScroll>
      <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 14 }]}>
        <IconButton icon="rotate-ccw" size={48} label={t("flt.clear")} onPress={() => setDraft({ ...defaultLawyerFilters, q: filters.q })} />
        <Button title={count.data != null ? `${t("flt.apply")} · ${count.data}` : t("flt.apply")} variant="gradient" loading={count.isFetching && count.data == null} onPress={apply} style={s.grow} full />
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1 },
  grow: { flex: 1 },
});
