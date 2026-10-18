import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { SosRequest } from "@/entities/sos";
import { HOTLINE } from "@/shared/config/contact";
import { openTel } from "@/shared/lib/links";
import { useColors } from "@/shared/theme";
import { Avatar, Button, Card, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { SosStage } from "../model/useSos";

type Props = { stage: Exclude<SosStage, "idle">; req: SosRequest | null; onAgain: () => void };

// connecting → spinner; connected → duty advocate + "Chatni ochish"; sent → accepted + hotline + "Qaytadan yuborish".
export function SosStatus({ stage, req, onAgain }: Props) {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  if (stage === "connecting") {
    return (
      <Card style={s.card}>
        <ActivityIndicator color={c.accent} size="large" />
        <Text variant="h4" center>{t("cxSos.connecting")}</Text>
        <Text variant="small" tone="gray" center>{t("cxSos.connectingSub")}</Text>
      </Card>
    );
  }
  const ok = <View style={[s.ok, { backgroundColor: c.okBg }]}><Icon name="shield" size={26} color={c.ok} /></View>;
  if (stage === "connected" && req) {
    return (
      <Card style={s.card}>
        {ok}
        <Text variant="h4" center>{t("cxSos.connectedTitle")}</Text>
        <View style={s.duty}>
          <Avatar name={req.dutyName || "A"} size={44} />
          <View style={{ flex: 1 }}>
            <Text variant="body" weight="bold">{req.dutyName || t("cxSos.dutyLawyer")}</Text>
            <Text variant="caption" tone="gray">{t("cxSos.dutyRole")}</Text>
          </View>
        </View>
        <Button title={t("cxSos.openChat")} icon="message-circle" full onPress={() => req.roomId && router.push({ pathname: "/chat/[roomId]", params: { roomId: req.roomId } })} />
      </Card>
    );
  }
  return (
    <Card style={s.card}>
      {ok}
      <Text variant="h4" center>{t("cxSos.sentTitle")}</Text>
      <Text variant="small" tone="gray" center>{t("cxSos.sentSub")}</Text>
      <Button title={`${t("cxSos.callNow")}  ${HOTLINE}`} icon="phone" variant="line" full onPress={() => openTel(HOTLINE)} />
      <Button title={t("cxSos.again")} variant="soft" full onPress={onAgain} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { alignItems: "stretch", gap: 12 },
  ok: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  duty: { flexDirection: "row", alignItems: "center", gap: 12 },
});
