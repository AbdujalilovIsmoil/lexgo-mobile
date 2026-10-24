import { StyleSheet, View } from "react-native";
import type { ProOrder } from "@/entities/pro-order";
import { callTypesOf, chatModeOf, type FlowPhase } from "@/entities/market-flow";
import { Avatar, Button, Icon, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// The buyer by public name and LexGo ID only — the phone stays hidden; contact goes through the secure chat once the backend unlocked it
// (TZ §6–§8: after the advance; a finished order's chat stays readable, its calls stop; only the call types the order allows).
type Props = { order: ProOrder; phase: FlowPhase; onChat: () => void; onCall?: (kind: "audio" | "video") => void; calling?: boolean };
export function BuyerCard({ order: o, phase, onChat, onCall, calling }: Props) {
  const { t } = useT();
  const view = { roomId: o.roomId, canStartChat: o.canChat, canCreateCall: o.canCall, flow: o.flow };
  const chat = chatModeOf(view, phase);
  const calls = callTypesOf(view, phase);
  return (
    <SectionCard title={t("sl9.buyer")}>
      <View style={s.row}>
        <Avatar name={o.buyerName || "?"} size={44} />
        <View style={s.col}>
          <Text variant="body" weight="bold" numberOfLines={1}>{o.buyerName || "—"}</Text>
          {o.buyerPublicId ? <Text variant="caption" tone="gray">{o.buyerPublicId}</Text> : null}
        </View>
      </View>
      <View style={s.row}>
        <Icon name="lock" size={14} tone="gray" />
        <Text variant="caption" tone="gray2" style={s.col}>{t(o.flow.contactUnlocked === false ? "mf.ct.phoneAfter" : "sl9.phoneHidden")}</Text>
      </View>
      {chat === "open" ? <Button title={t("sl9.openChat")} icon="message-circle" variant="soft" size="sm" onPress={onChat} /> : null}
      {chat === "readOnly" ? <Button title={t("mf.ct.viewChat")} icon="message-circle" variant="line" size="sm" onPress={onChat} /> : null}
      {chat === "locked" ? <Text variant="caption" tone="gray">{t("mf.pay.advanceWaitSeller")}</Text> : null}
      {calls.length && onCall ? (
        <View style={s.row}>
          {calls.includes("audio") ? <Button title={t("mk7.audio")} icon="phone" variant="soft" size="sm" disabled={calling} onPress={() => onCall("audio")} style={s.col} /> : null}
          {calls.includes("video") ? <Button title={t("mk7.video")} icon="video" variant="soft" size="sm" disabled={calling} onPress={() => onCall("video")} style={s.col} /> : null}
        </View>
      ) : null}
    </SectionCard>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 10 }, col: { flex: 1, gap: 1 } });
