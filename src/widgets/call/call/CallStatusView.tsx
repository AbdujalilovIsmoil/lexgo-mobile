import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Button, Icon, Text, type IconName } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

type Props = { kind: "connecting" | "error" | "ended" | "declined" | "missed"; message?: string; onRetry?: () => void; onBack: () => void };
const ICON: Record<string, IconName> = { error: "alert-triangle", ended: "phone-off", declined: "phone-off", missed: "phone-missed" };

// Full-screen state of the call route before / after the live room: joining, could not join, meeting over.
export function CallStatusView({ kind, message, onRetry, onBack }: Props) {
  const { t } = useT();
  const insets = useInsets();
  return (
    <View style={[s.fill, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={s.body}>
        {kind === "connecting" ? <ActivityIndicator color="#FFFFFF" size="large" /> : <View style={s.icon}><Icon name={ICON[kind]} size={30} color="#FFFFFF" /></View>}
        <Text variant="h3" tone="white" center>{kind === "connecting" ? t("admMeetB.joining") : kind === "ended" ? t("admMeet.endedTitle") : kind === "declined" || kind === "missed" ? t(`cht.${kind}`) : t("admMeetB.joinFailed")}</Text>
        {message ? <Text variant="small" center style={s.msg}>{message}</Text> : null}
      </View>
      <View style={s.acts}>
        {onRetry ? <Button title={t("admMeetB.retry")} variant="gradient" full onPress={onRetry} /> : null}
        <Button title={kind === "connecting" ? t("adm.cancel") : t("adm.back")} variant="glass" full onPress={onBack} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#03102B", paddingHorizontal: 20 },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  icon: { width: 68, height: 68, borderRadius: 34, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
  msg: { color: "#A5B4C8", maxWidth: 320 },
  acts: { gap: 10 },
});
