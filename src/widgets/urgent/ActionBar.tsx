import { StyleSheet, View } from "react-native";
import { Button } from "@/shared/ui";
import { ChatEntry } from "./ChatEntry";
import type { Action } from "./useRequestActions";

// The primary action (join the meeting / claim) is a full-width button, the chat is its own card beneath it; the rest wrap below.
export function ActionBar({ actions, chatWith }: { actions: Action[]; chatWith?: string }) {
  const main = actions.find((a) => a.primary);
  const chat = actions.find((a) => a.key === "chat");
  const rest = actions.filter((a) => a !== main && a !== chat);
  if (!actions.length) return null;
  return (
    <View style={s.col}>
      {main ? <Button title={main.label} icon={main.icon} variant="gradient" full loading={main.loading} onPress={main.run} /> : null}
      {chat ? <ChatEntry label={chat.label} who={chatWith} onPress={chat.run} /> : null}
      {rest.length ? (
        <View style={s.row}>
          {rest.map((a) => <Button key={a.key} title={a.label} icon={a.icon} size="sm" variant={a.soft ? "soft" : "line"} loading={a.loading} onPress={a.run} />)}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 10 }, row: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
