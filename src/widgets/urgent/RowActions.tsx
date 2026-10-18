import { StyleSheet, View } from "react-native";
import { Button } from "@/shared/ui";
import { joinable, type UrgentRequest } from "@/entities/urgent";
import { useUrgentNav } from "@/features/urgent-manage";
import { useT } from "@/shared/i18n";

type Props = { item: UrgentRequest; onOpen: () => void; claim?: { busy: boolean; run: () => void } };

// The quick actions under a list row: take the case (pool), enter the running meeting, open the chat, or the detail.
export function RowActions({ item, onOpen, claim }: Props) {
  const { t } = useT();
  const nav = useUrgentNav();
  return (
    <View style={s.row}>
      {claim ? <Button title={t("ug6.claim")} icon="check" size="sm" loading={claim.busy} onPress={claim.run} /> : null}
      {joinable(item) ? <Button title={t("ug5.join")} icon={item.callChannel === "audio" ? "phone" : "video"} size="sm" onPress={() => nav.join(item)} /> : null}
      {item.roomId ? <Button title={t("ug5.openChat")} icon="message-circle" size="sm" variant="line" onPress={() => nav.openChat(item)} /> : null}
      <Button title={t("adm.details")} icon="chevron-right" iconRight size="sm" variant="soft" onPress={onOpen} />
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
