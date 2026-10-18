import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { createChatSocket } from "@/entities/chat";
import { applyChatEvent, reconcileChat } from "./chatSync";

// Keeps ONE socket on the open chat: answers stream in even when the REST call is cut,
// every reconnect / foreground re-reads the chat, and `onReply` fires for each assistant message.
export function useChatSocket(clientId: string | null, chatId: string | null, onReply?: () => void): void {
  const reply = useRef(onReply);
  useEffect(() => {
    reply.current = onReply;
  });
  useEffect(() => {
    if (!clientId || !chatId) return;
    const sock = createChatSocket(clientId, chatId, {
      onEvent: (e) => applyChatEvent(chatId, e) && reply.current?.(),
      onOpen: (again) => again && void reconcileChat(clientId, chatId),
    });
    sock.start();
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") return;
      sock.nudge();
      void reconcileChat(clientId, chatId);
    });
    return () => {
      sub.remove();
      sock.stop();
    };
  }, [clientId, chatId]);
}
