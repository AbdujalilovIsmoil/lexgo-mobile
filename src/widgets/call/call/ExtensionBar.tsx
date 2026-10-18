import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import type { Extension } from "@/entities/call";
import { fmtMoney } from "@/shared/lib/money";
import { mmss } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// A paid extension waiting for the client's confirmation in Telegram (the meeting is on hold meanwhile and the request
// expires after 5 minutes). The app never confirms a payment: both sides just watch the request until the realtime event.
export function ExtensionBar({ pending, host }: { pending: Extension | null; host: boolean }) {
  const { t } = useT();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!pending) return null;
  const left = Math.max(0, Date.parse(pending.expiresAt) - now);
  const p = { minutes: pending.minutes, amount: fmtMoney(pending.amount) };
  return (
    <View style={s.bar}>
      <Icon name="credit-card" size={16} color="#FFFFFF" />
      <View style={s.col}>
        <Text variant="small" weight="semibold" tone="white">{host ? t("ms6.extWaitHost", p) : t("ms6.extWaitClient", p)}</Text>
        <Text variant="caption" style={s.sub}>{pending.expiresAt && left <= 0 ? t("ms6.extExpired") : pending.expiresAt ? t("ms6.extLeft", { time: mmss(left) }) : t("ms6.extTelegram")}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingVertical: 7, paddingHorizontal: 12, marginHorizontal: 12, marginTop: 6, backgroundColor: "#1D4ED8" },
  col: { flex: 1 },
  sub: { color: "#DCE8FF" },
});
