import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// How complete the profile is, as a white line on the profile's blue band (ProfileBandPage's `bandExtra`).
export function ProfileCompleteness({ percent }: { percent: number }) {
  const { t } = useT();
  const value = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text variant="caption" style={s.dim}>{t("sl4.completeness")}</Text>
        <Text variant="caption" weight="bold" tone="white">{percent}%</Text>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${value}%`, backgroundColor: value >= 100 ? "#3DDC97" : "#FFFFFF" }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 6 },
  head: { flexDirection: "row", justifyContent: "space-between" },
  dim: { color: "rgba(255,255,255,0.85)" },
  track: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.22)", overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
});
