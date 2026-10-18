import { StyleSheet, View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { maskContacts } from "../lib/maskContacts";
import type { Msg } from "../model/types";

// A system / result message: the backend narrating the room, drawn as a centred note.
export function Notice({ msg }: { msg: Msg }) {
  const { t } = useT();
  const c = useColors();
  const result = msg.type === "result";
  return (
    <View style={[s.box, { backgroundColor: c.surface2 }]}>
      <Icon name={result ? "check-square" : "info"} size={14} tone="gray" />
      <Text variant="caption" tone="gray" style={s.text}>
        <Text variant="caption" weight="bold" tone="gray">{result ? t("admChat.result") : t("admChat.system")}{msg.content ? ": " : ""}</Text>
        {maskContacts(msg.content)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: { alignSelf: "center", flexDirection: "row", gap: 7, alignItems: "flex-start", maxWidth: "90%", borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginVertical: 10 },
  text: { flexShrink: 1 },
});
