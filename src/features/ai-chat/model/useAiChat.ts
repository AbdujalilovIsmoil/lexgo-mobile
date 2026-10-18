import { useCallback } from "react";
import { getMessages } from "@/entities/chat";
import { useT } from "@/shared/i18n";
import { tapHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { useChatStore } from "./chatStore";
import { runSend } from "./sendFlow";
import { useClientId } from "./useClientId";

// The AI tab's controller: send / retry / open a past chat / start a new one.
export function useAiChat() {
  const { t } = useT();
  const clientId = useClientId();
  const store = useChatStore();

  const send = useCallback((text: string) => (clientId ? runSend(clientId, text) : Promise.resolve()), [clientId]);

  const retry = useCallback(
    (id: string) => {
      const m = useChatStore.getState().messages.find((x) => x.id === id);
      if (clientId && m) void runSend(clientId, m.content, id);
    },
    [clientId],
  );

  const open = useCallback(
    async (chatId: string) => {
      if (!clientId) return;
      const messages = await getMessages(clientId, chatId);
      useChatStore.getState().setChat(chatId, messages);
    },
    [clientId],
  );

  // A fresh conversation, with feedback so the tap is never silent.
  const newChat = useCallback(() => {
    useChatStore.getState().reset();
    tapHaptic();
    toast(t("ai.newChatStarted"), "ok");
  }, [t]);

  return { ...store, clientId, send, retry, open, newChat };
}
