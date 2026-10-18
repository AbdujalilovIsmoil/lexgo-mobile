import { StyleSheet, View } from "react-native";
import { useNow } from "@/shared/lib/pay/useNow";
import { useColors } from "@/shared/theme";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { useT } from "@/shared/i18n";

// The response window of a new order (30 business minutes): counts down live, turns red under five minutes and says "time is
// up" once it has passed (the order stays open; the client is offered other advocates).
export function RespondTimer({ deadline }: { deadline: string }) {
  const { t } = useT();
  const c = useColors();
  const now = useNow(true);
  const at = new Date(deadline).getTime();
  if (!deadline || Number.isNaN(at)) return null;
  const left = Math.max(0, Math.floor((at - now) / 1000));
  const tone = left === 0 ? c.err : left < 300 ? c.warn : c.accent;
  return (
    <View style={[s.chip, { backgroundColor: `${tone}22` }]} accessibilityLabel={t("shm.respond.hint")}>
      <Icon name="clock" size={12} color={tone} />
      <Text variant="caption" weight="bold" style={{ color: tone }}>{left === 0 ? t("shm.respond.over") : t("shm.respond.left", { time: `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` })}</Text>
    </View>
  );
}

const s = StyleSheet.create({ chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 } });
