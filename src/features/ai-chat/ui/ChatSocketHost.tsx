import { useCallback } from "react";
import { usePathname } from "expo-router";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { useChatStore } from "../model/chatStore";
import { useChatSocket } from "../model/useChatSocket";
import { useClientId } from "../model/useClientId";

// Mounted once in core: the open chat keeps its socket whichever tab the user is on, so an answer
// that takes a minute still arrives — with a toast when the AI tab is not in front.
export function ChatSocketHost() {
  const { t } = useT();
  const clientId = useClientId();
  const chatId = useChatStore((s) => s.chatId);
  const away = usePathname() !== "/ai";
  const onReply = useCallback(() => away && toast(t("ax1.replyReady"), "info"), [away, t]);
  useChatSocket(clientId, chatId, onReply);
  return null;
}
