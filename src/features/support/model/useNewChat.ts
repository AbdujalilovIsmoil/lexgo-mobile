import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { topicOf } from "@/entities/support";
import { useTopics } from "./useTopics";

type Chat = { open: boolean; message: string; topic: string; force: boolean };

// Opens the new-chat window like the web hub's `?new=1` / `?topic=…`: from the route params (once per
// distinct set) or from the "new chat" buttons. Closing clears the params so the same link works again.
export function useNewChat(signedIn: boolean) {
  const params = useLocalSearchParams<{ new?: string; topic?: string; q?: string; force?: string }>();
  const router = useRouter();
  const topics = useTopics();
  const [chat, setChat] = useState<Chat>({ open: false, message: "", topic: "", force: false });
  const [seen, setSeen] = useState("");
  const wants = params.new === "1" || Boolean(params.topic);
  const key = [params.new, params.topic, params.q, params.force].join("|");
  if (!wants && seen) setSeen("");
  if (wants && signedIn && seen !== key) {
    setSeen(key);
    setChat({ open: true, message: params.q ?? "", topic: topicOf(params.topic ?? "", topics), force: params.force === "1" });
  }
  const start = (force: boolean) => setChat({ open: true, message: "", topic: "", force });
  const close = () => {
    setChat((c) => ({ ...c, open: false }));
    if (wants) router.setParams({ new: undefined, topic: undefined, q: undefined, force: undefined });
  };
  return { chat, start, close };
}
