import { StyleSheet, View } from "react-native";
import { Button, Icon, Text } from "@/shared/ui";
import { useReveal } from "@/entities/secure-chat";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { fmtDateTime } from "@/shared/lib/format";

type Props = { roomId: string; pending: boolean; onAsk: () => void; onApprove: () => void };

// Staff do not read other people's chats by default: this bar says so and starts the
// request → approve flow; once a reveal is active it only shows how long it lasts.
export function RevealBanner({ roomId, pending, onAsk, onApprove }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const r = useReveal(roomId).data;
  if (!r) return null;
  if (r.visible && !r.expiresAt) return null;
  const hidden = !r.visible;
  return (
    <View style={[s.box, { backgroundColor: hidden ? c.warnBg : c.okBg }]}>
      <View style={s.head}>
        <Icon name={hidden ? "lock" : "unlock"} size={16} color={hidden ? c.warn : c.ok} />
        <Text variant="small" weight="bold" style={{ color: hidden ? c.warn : c.ok }}>{hidden ? (pending ? t("admChat.revealPending") : t("admChat.revealLocked")) : t("admChat.revealActive", { time: fmtDateTime(r.expiresAt, locale) })}</Text>
      </View>
      {hidden ? (
        <View style={s.acts}>
          {!pending ? <Button title={t("admChat.revealAsk")} size="sm" variant="primary" onPress={onAsk} /> : null}
          <Button title={t("admChat.revealApprove")} size="sm" variant="line" onPress={onApprove} />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { paddingVertical: 8, paddingHorizontal: 14, gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  acts: { flexDirection: "row", gap: 8 },
});
