import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Button, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// pending_payment in words: the payment is approved in Telegram, the app only waits for the server.
export function PendingNote({ onCheck, checking }: { onCheck: () => void; checking: boolean }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={[s.box, { backgroundColor: c.warnBg }]}>
      <View style={s.head}>
        <Icon name="clock" size={20} color={c.warn} />
        <Text variant="body" weight="bold" style={s.flex}>{t("mk4.pendingTitle")}</Text>
      </View>
      <Text variant="small" tone="gray">{t("mk4.pendingText")}</Text>
      <Text variant="caption" tone="gray2">{t("mk3.live")}</Text>
      <Button title={t("mk3.recheck")} onPress={onCheck} loading={checking} variant="soft" size="sm" icon="refresh-cw" />
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: 20, padding: 16, gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
});
