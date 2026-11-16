import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import type { SellerOrder } from "@/entities/pro-workspace";
import type { ReqItem } from "@/entities/pro-requests";
import { useNow } from "@/shared/lib/pay/useNow";
import { useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";


const leftOf = (ms: number): string => {
  const m = Math.floor(ms / 60_000);
  return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}` : `${m}:${String(Math.floor((ms % 60_000) / 1000)).padStart(2, "0")}`;
};

// The one thing that cannot wait (Adliya: the navy strip at the foot of the "Bugun" card): the order offered to this professional whose
// response window closes soonest (with the live countdown), or else the newest urgent request waiting for them. "Ochish" opens it; "+N" says
// how many more wait. Nothing when none.
export function AssignedAlert({ orders, urgent }: { orders: SellerOrder[]; urgent: ReqItem[] }) {
  const { t } = useT();
  const router = useRouter();
  const { dark } = useTheme();
  const timed = orders.filter((o) => o.deadline).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const order = timed[0] ?? orders[0];
  const live = urgent.filter((u) => u.active && u.action);
  const now = useNow(!!order?.deadline);
  if (!order && !live.length) return null;
  const more = (order ? orders.length : live.length) - 1;
  const title = order ? t("shm.ws.alertTitle") : t("shm.ws.alertUrgent");
  const what = order ? order.serviceName || order.title : live[0].title || live[0].detail;
  const ms = order?.deadline ? Date.parse(order.deadline) - now : NaN;
  const when = Number.isNaN(ms) ? "" : ms <= 0 ? t("shm.ws.timeUp") : t("shm.ws.left", { time: leftOf(ms) });
  const open = () => router.push((order ? "/pro/orders" : live[0].route || "/pro/urgent") as never);
  return (
    <Animated.View entering={FadeInDown.duration(260)} style={[s.bar, { backgroundColor: dark ? "#1A2D5C" : "#0F2149" }]}>
      <Icon name="zap" size={18} color="#FFFFFF" />
      <View style={s.txt}>
        <Text variant="small" weight="semibold" numberOfLines={1} style={s.title}>{title}{when ? <Text variant="small" weight="bold" style={s.when}>{`  ${when}`}</Text> : null}</Text>
        {what || more > 0 ? <Text variant="caption" numberOfLines={1} style={s.sub}>{[what, more > 0 ? t("shm.ws.alertMore", { n: more }) : ""].filter(Boolean).join(" · ")}</Text> : null}
      </View>
      <PressableScale onPress={open} accessibilityRole="button" accessibilityLabel={`${t("shm.ws.open")}: ${title}`} style={s.btn}>
        <Text variant="small" weight="bold" style={s.btnTx}>{t("shm.ws.open")}</Text>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingLeft: 16, paddingRight: 8, paddingVertical: 8, minHeight: 60, borderRadius: 16 },
  txt: { flex: 1, minWidth: 0, gap: 1 },
  title: { color: "#FFFFFF", fontSize: 14 },
  when: { color: "#FFFFFF", fontSize: 14 },
  sub: { color: "#AFC0E0" },
  btn: { backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11 },
  btnTx: { color: "#0B1A33", fontSize: 14 },
});
