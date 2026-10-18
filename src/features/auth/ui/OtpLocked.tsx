import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Icon, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtWait } from "../lib/fmtWait";

type Props = { left: number; message: string | null; busy: boolean; onNewCode: () => void };

// Three wrong codes: the server blocks the phone (15 min) and the old code is dead. The inputs are
// replaced by this card until the block ends, then a new code can be requested.
export function OtpLocked({ left, message, busy, onNewCode }: Props) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  return (
    <View style={[s.box, { backgroundColor: `${c.err}14`, borderColor: `${c.err}55` }]}>
      <Icon name="lock" size={26} color={c.err} />
      <Text variant="h4" center>{t("au2.lockedTitle")}</Text>
      <Text variant="small" tone="gray" center>{left > 0 ? t("au2.blockedFor", { time: fmtWait(left) }) : t("au2.lockedText")}</Text>
      {message && left > 0 ? <Text variant="caption" tone="err" center>{message}</Text> : null}
      {left <= 0 ? <Button title={t("au2.newCode")} onPress={onNewCode} loading={busy} variant="gradient" full icon="refresh-cw" /> : null}
      <Button title={t("au2.changePhone")} onPress={() => router.back()} variant="ghost" icon="chevron-left" />
    </View>
  );
}

const s = StyleSheet.create({ box: { alignItems: "center", gap: 10, padding: 18, borderRadius: radius.r, borderWidth: 1.5 } });
