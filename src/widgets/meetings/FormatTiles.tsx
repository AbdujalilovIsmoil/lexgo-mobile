import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import type { CallType } from "@/entities/call";
import { selectHaptic } from "@/shared/lib/haptics";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Meeting format as two big tiles (Video / Audio): an icon in a round chip and the name; the chosen one gets an accent border.
export function FormatTiles({ value, onChange }: { value: CallType; onChange: (v: CallType) => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.row} accessibilityRole="radiogroup">
      {(["video", "audio"] as const).map((k) => {
        const on = value === k;
        return (
          <PressableScale
            key={k}
            haptic={false}
            scale={0.96}
            onPress={() => { if (!on) selectHaptic(); onChange(k); }}
            accessibilityRole="radio"
            accessibilityLabel={t(`admMeet.fmt.${k}`)}
            accessibilityState={{ selected: on }}
            style={[s.tile, { backgroundColor: on ? c.tint : c.surface2, borderColor: on ? c.accent : c.line }]}
          >
            <View style={[s.icon, { backgroundColor: on ? c.accent : c.surface }]}><Icon name={k === "video" ? "video" : "mic"} size={22} color={on ? "#FFFFFF" : c.gray} /></View>
            <Text variant="body" weight="bold" style={{ color: on ? c.accentStrong : c.ink }}>{t(`admMeet.fmt.${k}`)}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  tile: { flex: 1, minHeight: 98, alignItems: "center", justifyContent: "center", gap: 10, borderRadius: radius.rl, borderWidth: 2, paddingVertical: 14 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
