import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { radius, useColors } from "@/shared/theme";
import { Icon, LiveDot, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The one thing that cannot wait, pinned above the hero: new client requests with a live dot ("3 new requests — respond"). A tap
// opens the orders list. Nothing is drawn when there are none.
export function NewAlert({ n }: { n: number }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  if (!n) return null;
  return (
    <Animated.View entering={FadeInDown.duration(260)}>
      <PressableScale onPress={() => router.push("/pro/orders" as never)} accessibilityRole="button" style={[s.card, { backgroundColor: c.warnBg, borderColor: c.warn }]}>
        <LiveDot color={c.warn} size={9} />
        <View style={s.txt}>
          <Text variant="small" weight="bold" style={{ color: c.warn }}>{t("shm.alert.title", { n })}</Text>
          <Text variant="caption" tone="gray">{t("shm.alert.sub")}</Text>
        </View>
        <Icon name="chevron-right" size={18} color={c.warn} />
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({ card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.r, borderWidth: 1 }, txt: { flex: 1, gap: 2 } });
