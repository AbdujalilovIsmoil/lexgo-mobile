import { StyleSheet, View } from "react-native";
import type { ProOrder } from "@/entities/pro-order";
import { Avatar, Button, Icon, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// The buyer by public name and LexGo ID only — the phone stays hidden; contact goes through the secure chat (TZ 18).
type Props = { order: ProOrder; onChat: () => void; onCall?: (kind: "audio" | "video") => void; calling?: boolean };
export function BuyerCard({ order: o, onChat, onCall, calling }: Props) {
  const { t } = useT();
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
        <Text variant="caption" tone="gray2" style={s.col}>{t("sl9.phoneHidden")}</Text>
      </View>
      {o.canChat ? <Button title={t("sl9.openChat")} icon="message-circle" variant="soft" size="sm" onPress={onChat} /> : null}
      {o.canCall && onCall ? (
        <View style={s.row}>
          <Button title={t("mk7.audio")} icon="phone" variant="soft" size="sm" disabled={calling} onPress={() => onCall("audio")} style={s.col} />
          <Button title={t("mk7.video")} icon="video" variant="soft" size="sm" disabled={calling} onPress={() => onCall("video")} style={s.col} />
        </View>
      ) : null}
    </SectionCard>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 10 }, col: { flex: 1, gap: 1 } });
