import { useEffect, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Button, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { denied: { mic: boolean; cam: boolean }; alone: boolean; onStay: () => void; onLeave: () => void; paused: boolean; reconnecting: boolean; failed: boolean; onRetry: () => void };

function Bar({ icon, text, tone, action }: { icon: "mic-off" | "video-off" | "pause-circle" | "wifi-off" | "log-out" | "alert-triangle"; text: string; tone: string; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={[s.bar, { backgroundColor: tone }]}>
      <Icon name={icon} size={16} color="#FFFFFF" />
      <Text variant="small" weight="semibold" tone="white" style={s.text}>{text}</Text>
      {action ? <Button title={action.label} size="sm" variant="glass" onPress={action.onPress} /> : null}
    </View>
  );
}

const GRACE_SEC = 10;
// Everybody else left: counts down and leaves too, unless the person taps "stay". Mounted only while alone,
// so the countdown restarts from scratch every time it is needed.
function AloneBar({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  const { t } = useT();
  const [left, setLeft] = useState(GRACE_SEC);
  useEffect(() => {
    const id = setInterval(() => setLeft((n) => n - 1), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { if (left <= 0) onLeave(); }, [left, onLeave]);
  return <Bar icon="log-out" tone="#475569" text={t("admMeet.alone", { s: Math.max(0, left) })} action={{ label: t("admMeetB.stay"), onPress: onStay }} />;
}

// Thin notices stacked under the header: permissions refused, connection lost, meeting on hold,
// "everybody left — leaving in N s".
export function CallBanners({ denied, alone, onStay, onLeave, paused, reconnecting, failed, onRetry }: Props) {
  const { t } = useT();
  const settings = { label: t("admMeetB.settings"), onPress: () => void Linking.openSettings() };
  return (
    <View style={s.stack}>
      {failed ? <Bar icon="alert-triangle" tone="#B42318" text={t("admMeetB.status.error")} action={{ label: t("admMeetB.retry"), onPress: onRetry }} /> : null}
      {reconnecting ? <Bar icon="wifi-off" tone="#B45309" text={t("admMeetB.status.reconnecting")} /> : null}
      {denied.mic ? <Bar icon="mic-off" tone="#B42318" text={t("admMeet.micDenied")} action={settings} /> : null}
      {denied.cam ? <Bar icon="video-off" tone="#B42318" text={t("admMeet.camDenied")} action={settings} /> : null}
      {paused ? <Bar icon="pause-circle" tone="#1D4ED8" text={t("admMeetB.pausedPlain")} /> : null}
      {alone ? <AloneBar onStay={onStay} onLeave={onLeave} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  stack: { gap: 6, paddingHorizontal: 12 },
  bar: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingVertical: 7, paddingHorizontal: 12 },
  text: { flex: 1 },
});
