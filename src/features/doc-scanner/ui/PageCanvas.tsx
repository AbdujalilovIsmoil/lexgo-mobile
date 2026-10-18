import { Image, StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { IconButton, Text } from "@/shared/ui";
import type { ScanPage } from "../model/types";

type Props = { page: ScanPage; index: number; total: number; onRotate: () => void; onRemove: () => void; onShift: (by: number) => void };

// The page being edited, as it will be exported (the rendered preview), with its tools floating at the bottom edge.
export function PageCanvas({ page, index, total, onRotate, onRemove, onShift }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={[s.box, { backgroundColor: c.surface2, borderColor: c.line }]}>
      <Image source={{ uri: page.preview || page.uri }} resizeMode="contain" style={s.img} accessibilityLabel={t("scn.page", { n: index + 1 })} />
      <View style={s.badge}><Text variant="caption" weight="bold" tone="white">{index + 1} / {total}</Text></View>
      <View style={s.tools}>
        <IconButton icon="arrow-left" tone="glass" size={44} label={t("scn.left")} onPress={() => onShift(-1)} />
        <IconButton icon="rotate-cw" tone="glass" size={44} label={t("scn.rotate")} onPress={onRotate} />
        <IconButton icon="arrow-right" tone="glass" size={44} label={t("scn.right")} onPress={() => onShift(1)} />
        <IconButton icon="trash-2" tone="glass" size={44} label={t("scn.remove")} onPress={onRemove} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flex: 1, borderRadius: 22, borderWidth: 1, overflow: "hidden", padding: 10 },
  img: { flex: 1, borderRadius: 12 },
  badge: { position: "absolute", top: 14, left: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: "rgba(10,21,38,0.7)" },
  tools: { position: "absolute", bottom: 14, alignSelf: "center", flexDirection: "row", gap: 10, padding: 6, borderRadius: 30, backgroundColor: "rgba(10,21,38,0.62)" },
});
