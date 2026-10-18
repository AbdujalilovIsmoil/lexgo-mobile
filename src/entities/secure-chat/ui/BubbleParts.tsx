import { StyleSheet, View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { fmtTime } from "@/shared/lib/format";
import { roleKey } from "../lib/roleLabel";
import type { Msg } from "../model/types";
import { DoubleCheck } from "./DoubleCheck";

// "Name  ADVOKAT" above an incoming bubble: the name, then the role as a small pill (web chat).
export function SenderLine({ msg }: { msg: Msg }) {
  const { t } = useT();
  const c = useColors();
  const role = msg.sender && roleKey(msg.sender.role) ? t(roleKey(msg.sender.role)) : "";
  return (
    <View style={s.line}>
      <Text variant="caption" weight="bold" numberOfLines={1} style={s.name}>{msg.sender?.name || t("admChat.someone")}</Text>
      {role ? <View style={[s.role, { backgroundColor: c.tint2 }]}><Text variant="caption" weight="bold" style={[s.roleT, { color: c.accentStrong }]}>{role}</Text></View> : null}
    </View>
  );
}

// Time and the delivery mark of my own message, as on the web: clock (sending), double tick (stored on the server),
// alert (failed). The backend sends no per-recipient read receipt (a message has no read field), so the double tick
// means "delivered to the room", not "read" - the same as the web chat.
export function Meta({ msg, mine, fg }: { msg: Msg; mine: boolean; fg: string }) {
  return (
    <View style={s.meta}>
      <Text variant="caption" style={{ color: fg, opacity: 0.7 }}>{fmtTime(msg.createdAt)}</Text>
      {mine ? (msg.failed || msg.pending ? <Icon name={msg.failed ? "alert-circle" : "clock"} size={12} color={fg} /> : <DoubleCheck color={fg} />) : null}
    </View>
  );
}

const s = StyleSheet.create({
  line: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { flexShrink: 1 },
  role: { paddingHorizontal: 8, height: 20, borderRadius: 10, justifyContent: "center" },
  roleT: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6 },
  meta: { flexDirection: "row", alignSelf: "flex-end", alignItems: "center", gap: 4, marginTop: 1 },
});
