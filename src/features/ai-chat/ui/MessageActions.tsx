import { StyleSheet, View } from "react-native";
import { useAiTheme } from "@/shared/theme";
import { Icon, PressableScale, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { ChatMessage } from "@/entities/chat";
import { useChatStore } from "../model/chatStore";
import { useCopyShare } from "../model/useCopyShare";

type Props = { message: ChatMessage; onDislike: (id: string) => void; onLike: (id: string) => void };

function Act({ icon, label, onPress, on, disabled }: { icon: IconName; label: string; onPress: () => void; on?: boolean; disabled?: boolean }) {
  const aiTheme = useAiTheme();
  return (
    <PressableScale onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={[s.btn, on && s.on, disabled && !on && s.dim]}>
      <Icon name={icon} size={15} color={on ? aiTheme.accent : aiTheme.muted} />
    </PressableScale>
  );
}

// Copy / share / useful / not useful under a finished assistant answer.
export function MessageActions({ message, onLike, onDislike }: Props) {
  const { t } = useT();
  const { copy, share } = useCopyShare();
  const vote = useChatStore((st) => st.feedback[message.id]);
  return (
    <View style={s.row}>
      <Act icon="copy" label={t("ax1.copy")} onPress={() => void copy(message.content)} />
      <Act icon="share-2" label={t("ax1.share")} onPress={() => share(message.content)} />
      <Act icon="thumbs-up" label={t("ax1.useful")} onPress={() => onLike(message.id)} on={vote === "up"} disabled={!!vote} />
      <Act icon="thumbs-down" label={t("ax1.notUseful")} onPress={() => onDislike(message.id)} on={vote === "down"} disabled={!!vote} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, marginTop: 4, marginLeft: 4 },
  btn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  on: { backgroundColor: "rgba(95,217,255,0.14)" },
  dim: { opacity: 0.4 },
});
