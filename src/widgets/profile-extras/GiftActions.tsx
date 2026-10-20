import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { brand, radius, shadows, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

function Tile({ icon, title, hint, onPress, primary }: { icon: IconName; title: string; hint: string; onPress: () => void; primary?: boolean }) {
  const c = useColors();
  const ink = primary ? "#FFFFFF" : c.ink;
  const body = (
    <>
      <View style={[s.ico, { backgroundColor: primary ? "rgba(255,255,255,0.2)" : c.tint2 }]}><Icon name={icon} size={22} color={primary ? "#FFFFFF" : c.accent} /></View>
      <View style={s.txt}>
        <Text variant="body" weight="bold" numberOfLines={1} style={{ color: ink }}>{title}</Text>
        <Text variant="caption" numberOfLines={1} style={{ color: ink, opacity: 0.8 }}>{hint}</Text>
      </View>
    </>
  );
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" style={s.flex}>
      {primary ? <LinearGradient colors={[brand.b700, brand.b600, "#0E9FD0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.tile, shadows.blue]}>{body}</LinearGradient> : <View style={[s.tile, { backgroundColor: c.glassFill, borderWidth: 1, borderColor: c.glassLine }]}>{body}</View>}
    </PressableScale>
  );
}

// The two ways into gifts as big tiles: give one (primary) or claim one by its code.
export function GiftActions({ onGive, onClaim }: { onGive: () => void; onClaim: () => void }) {
  const { t } = useT();
  return (
    <View style={s.row}>
      <Tile primary icon="gift" title={t("gfx.give")} hint={t("gfx.giveHint")} onPress={onGive} />
      <Tile icon="key" title={t("gfx.claim")} hint={t("gfx.claimHint")} onPress={onClaim} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginBottom: 14 },
  flex: { flex: 1 },
  tile: { gap: 12, padding: 14, minHeight: 112, borderRadius: radius.rl, justifyContent: "space-between" },
  ico: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  txt: { gap: 2 },
});
