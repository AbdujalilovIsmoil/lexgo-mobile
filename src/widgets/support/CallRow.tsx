import { StyleSheet, View } from "react-native";
import { Button, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { SupportCall } from "@/entities/support";

type Props = { call: SupportCall; onJoin: () => void; onDismiss: () => void };

// The operator started a support call (POST /call-center/support/tickets/{id}/calls): join it from here.
export function CallRow({ call, onJoin, onDismiss }: Props) {
  const { t } = useT();
  const c = useColors();
  const video = call.callType === "video";
  return (
    <View style={[s.box, { backgroundColor: c.okBg, borderColor: c.ok }]}>
      <View style={s.head}>
        <Icon name={video ? "video" : "phone-call"} size={22} color={c.ok} />
        <View style={s.fill}>
          <Text variant="body" weight="bold">{t("sp3.callIncoming")}</Text>
          <Text variant="caption" tone="gray">{video ? t("sp3.callVideo") : t("sp3.callAudio")}</Text>
        </View>
      </View>
      <View style={s.head}>
        <Button title={t("sp3.callJoin")} size="sm" icon={video ? "video" : "phone"} onPress={onJoin} style={s.fill} />
        <Button title={t("sp3.callLater")} size="sm" variant="line" onPress={onDismiss} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 12, padding: 14, borderRadius: 18, borderWidth: 1, marginVertical: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  fill: { flex: 1 },
});
