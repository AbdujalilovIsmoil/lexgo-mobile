import { StyleSheet, View } from "react-native";
import { PREFERRED_CHANNELS, type PreferredChannel } from "@/entities/order";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

const ICON: Record<PreferredChannel, IconName> = { chat: "message-circle", audio: "phone", video: "video" };

// "How do you want to talk?" as cards (icon tile + name): chat / audio / video — the channels a purchase request may name.
export function ChannelPick({ value, onChange }: { value: PreferredChannel; onChange: (c: PreferredChannel) => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.grid}>
      {PREFERRED_CHANNELS.map((k) => {
        const on = k === value;
        return (
          <PressableScale key={k} haptic={false} onPress={() => { selectHaptic(); onChange(k); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.card, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? c.accent : c.line }]}>
            <View style={[s.ico, { backgroundColor: on ? c.accent : c.surface }]}><Icon name={ICON[k]} size={18} color={on ? "#FFFFFF" : c.accent} /></View>
            <Text variant="small" weight="bold" numberOfLines={2} style={s.flex}>{t(`mk3.channels.${k}`)}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { flexBasis: "30%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 60, padding: 10, borderRadius: radius.r, borderWidth: 1.5 },
  ico: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
});
