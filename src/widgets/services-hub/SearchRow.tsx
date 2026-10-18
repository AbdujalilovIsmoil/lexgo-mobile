import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useServiceText } from "./useServiceText";
import { Chip, IconButton } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { Hub } from "./useServicesHub";

// The search field and the one filter button side by side; what the sheet applied shows underneath as chips that clear one by one.
export function SearchRow({ hub, onFilters }: { hub: Hub; onFilters: () => void }) {
  const { t } = useT();
  const x = useServiceText();
  const { f } = hub;
  const cat = hub.cats.find((c) => c.id === f.cat);
  const chips: { key: string; label: string; clear: () => void }[] = [
    ...(f.cat ? [{ key: "cat", label: cat?.name ?? "", clear: () => hub.set({ cat: "" }) }] : []),
    ...(f.doc !== "all" ? [{ key: "doc", label: x.doc(f.doc), clear: () => hub.set({ doc: "all" }) }] : []),
    ...(f.exec !== "all" ? [{ key: "exec", label: x.exec(f.exec), clear: () => hub.set({ exec: "all" }) }] : []),
    ...(f.price !== "all" ? [{ key: "price", label: x.price(f.price), clear: () => hub.set({ price: "all" }) }] : []),
    ...(f.sort !== "rel" ? [{ key: "sort", label: x.sort(f.sort), clear: () => hub.set({ sort: "rel" }) }] : []),
  ];
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <View style={s.flex}><SearchBox value={hub.q} onChangeText={hub.setQ} placeholder={t("csv.search")} /></View>
        <IconButton icon="sliders" label={t("dm11.filters")} badge={hub.active > 0} onPress={onFilters} />
      </View>
      {chips.length ? (
        <View style={s.chips}>
          {chips.map((c) => <Animated.View key={c.key} entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}><Chip label={c.label} active icon="x" onPress={c.clear} /></Animated.View>)}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginHorizontal: -16, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", paddingRight: 16 },
  flex: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16 },
});
