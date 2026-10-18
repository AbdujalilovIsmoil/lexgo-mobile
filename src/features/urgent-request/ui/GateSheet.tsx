import { useRouter } from "expo-router";
import { View } from "react-native";
import { BottomSheet, Button, Icon, SheetScroll, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { UrgentService } from "@/entities/urgent";

type Props = { message: string; services: UrgentService[]; onClose: () => void; onPick: (key: string) => void };

// 402 previous_lexgo_advokat_service_required: the backend's own sentence, then the ways forward.
// The single-advocate second opinion needs no earlier service, so it is offered first.
export function GateSheet({ message, services, onClose, onPick }: Props) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const open = (k: string) => services.some((s) => s.key === k && !s.requiresPriorPurchase);
  const go = (path: string) => { onClose(); router.push(path as never); };
  return (
    <BottomSheet visible={!!message} onClose={onClose} title={t("ug3.gateTitle")} snaps={[0.6, 0.9]}>
      <SheetScroll>
        <View style={{ alignItems: "center", gap: 10 }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: c.warnBg }}><Icon name="lock" size={24} color={c.warn} /></View>
          <Text variant="body" center>{message}</Text>
          <Text variant="small" tone="gray" center>{t("ug3.gateHow")}</Text>
        </View>
        {open("second_opinion_single") ? <Button title={t("ug3.ctaSingle")} icon="user-check" variant="gradient" full onPress={() => onPick("second_opinion_single")} /> : null}
        {open("video_consultation") ? <Button title={t("ug3.ctaVideo")} icon="video" variant="line" full onPress={() => onPick("video_consultation")} /> : null}
        {open("chat_consultation") ? <Button title={t("ug3.ctaChat")} icon="message-circle" variant="line" full onPress={() => onPick("chat_consultation")} /> : null}
        <Button title={t("ug3.ctaDocument")} icon="file-text" variant="line" full onPress={() => go("/documents")} />
        <Button title={t("ug3.ctaBrowse")} icon="grid" variant="soft" full onPress={() => go("/services")} />
      </SheetScroll>
    </BottomSheet>
  );
}
