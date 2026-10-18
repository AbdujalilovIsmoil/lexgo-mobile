import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { Button, IconButton } from "@/shared/ui";
import type { Action } from "../useRequestActions";
import { MoreSheet } from "./MoreSheet";

// The sticky bar: the primary action of the current status (join / claim, else the chat) full width, the chat and a "more" button
// beside it; everything else lives in the "more" sheet.
export function ActionDock({ actions }: { actions: Action[] }) {
  const { t } = useT();
  const [more, setMore] = useState(false);
  const chat = actions.find((a) => a.key === "chat");
  const main = actions.find((a) => a.primary) ?? chat;
  const side = main === chat ? undefined : chat;
  const rest = actions.filter((a) => a !== main && a !== side);
  return (
    <View style={s.row}>
      {main ? <Button title={main.label} icon={main.icon} variant="gradient" full loading={main.loading} onPress={main.run} style={s.flex} /> : <Button title={t("ugx.more")} icon="more-horizontal" variant="soft" full onPress={() => setMore(true)} style={s.flex} />}
      {side ? <IconButton icon="message-circle" size={52} label={side.label} onPress={side.run} /> : null}
      {main && rest.length ? <IconButton icon="more-horizontal" size={52} label={t("ugx.more")} onPress={() => setMore(true)} /> : null}
      <MoreSheet actions={rest} visible={more} onClose={() => setMore(false)} />
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 10 }, flex: { flex: 1 } });
