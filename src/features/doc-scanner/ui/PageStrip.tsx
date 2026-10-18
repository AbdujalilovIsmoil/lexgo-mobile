import { Image, ScrollView, StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import type { ScanPage } from "../model/types";

// Thumbnails of all pages (the open one is outlined) and a "+" tile that adds another page.
export function PageStrip({ pages, current, onPick, onAdd }: { pages: ScanPage[]; current: number; onPick: (i: number) => void; onAdd: () => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.scroll} contentContainerStyle={s.row}>
      {pages.map((p, i) => (
        <PressableScale key={p.id} scale={0.94} onPress={() => onPick(i)} accessibilityRole="button" accessibilityState={{ selected: i === current }} accessibilityLabel={t("scn.page", { n: i + 1 })} style={[s.thumb, { borderColor: i === current ? c.accent : c.line, borderWidth: i === current ? 2.5 : 1, backgroundColor: c.surface2 }]}>
          <Image source={{ uri: p.preview || p.uri }} resizeMode="cover" style={s.img} />
          <View style={s.num}><Text variant="caption" weight="bold" tone="white" style={s.numTx}>{i + 1}</Text></View>
        </PressableScale>
      ))}
      <PressableScale onPress={onAdd} accessibilityLabel={t("scn.add")} style={[s.thumb, s.add, { borderColor: c.accent, backgroundColor: c.tint2 }]}>
        <Icon name="plus" size={22} tone="accent" />
      </PressableScale>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { gap: 10, paddingHorizontal: 16, paddingVertical: 4 },
  thumb: { width: 58, height: 78, borderRadius: 12, overflow: "hidden" },
  img: { width: "100%", height: "100%" },
  num: { position: "absolute", left: 4, bottom: 4, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, backgroundColor: "rgba(10,21,38,0.75)", alignItems: "center", justifyContent: "center" },
  numTx: { fontSize: 10 },
  add: { borderStyle: "dashed", borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});
