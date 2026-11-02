import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import type { SellerOrder } from "@/entities/pro-workspace";
import type { ReqItem } from "@/entities/pro-requests";
import { useNow } from "@/shared/lib/pay/useNow";
import { radius, useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const ORANGE = "#E8662E";
const BG = "rgba(232,102,46,0.10)";

const leftOf = (ms: number): string => {
  const m = Math.floor(ms / 60_000);
  return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}` : `${m}:${String(Math.floor((ms % 60_000) / 1000)).padStart(2, "0")}`;
};

// The one thing that cannot wait, first on the page: the order offered to this professional whose response window closes soonest (with the
// live countdown), or else the newest urgent request waiting for them. "Ochish" opens it; "+N" says how many more wait. Nothing when none.
export function AssignedAlert({ orders, urgent }: { orders: SellerOrder[]; urgent: ReqItem[] }) {
  const { t } = useT();
  const router = useRouter();
  const { dark } = useTheme();
  const ink = dark ? "#FDBA8C" : "#9A3412";
  const sub = dark ? "#F6D3BD" : "#7C2D12";
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
  const line = [what, when, more > 0 ? t("shm.ws.alertMore", { n: more }) : ""].filter(Boolean).join(" · ");
  const open = () => router.push((order ? "/pro/orders" : live[0].route || "/pro/urgent") as never);
  return (
    <Animated.View entering={FadeInDown.duration(260)} style={[s.card, { backgroundColor: BG }]}>
      <View style={s.row}>
        <View style={s.ico}><Icon name="zap" size={18} color="#FFFFFF" /></View>
        <View style={s.txt}>
          <Text variant="body" weight="bold" style={{ color: ink }}>{title}</Text>
          {line ? <Text variant="small" numberOfLines={2} style={{ color: sub }}>{line}</Text> : null}
        </View>
      </View>
      <PressableScale onPress={open} accessibilityRole="button" accessibilityLabel={`${t("shm.ws.open")}: ${title}`} style={s.btn}>
        <Text variant="small" weight="bold" tone="white">{t("shm.ws.open")}</Text>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, gap: 14, borderRadius: radius.rl, borderWidth: 1, borderColor: "rgba(232,102,46,0.22)" },
  row: { flexDirection: "row", gap: 12 },
  ico: { width: 36, height: 36, borderRadius: 11, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1, gap: 3 },
  btn: { alignSelf: "flex-start", marginLeft: 48, backgroundColor: ORANGE, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 11 },
});
