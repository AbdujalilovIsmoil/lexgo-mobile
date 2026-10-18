import { StyleSheet, View } from "react-native";
import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { onIn: () => void; onOut: () => void; onFit: () => void; bottom: number };

// Zoom in / out / fit buttons floating over the chart.
export function ChartControls({ onIn, onOut, onFit, bottom }: Props) {
  const { t } = useT();
  return (
    <View style={[s.col, { bottom }]}>
      <IconButton icon="plus" size={42} onPress={onIn} label={t("ag8.org.zoomIn")} />
      <IconButton icon="minus" size={42} onPress={onOut} label={t("ag8.org.zoomOut")} />
      <IconButton icon="maximize" size={42} onPress={onFit} label={t("ag8.org.fit")} />
    </View>
  );
}

const s = StyleSheet.create({ col: { position: "absolute", right: 14, gap: 8 } });
