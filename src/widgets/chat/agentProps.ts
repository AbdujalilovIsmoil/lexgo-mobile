import type { Agent, ChatMessage } from "@/entities/chat";

// Follow-up chips and "retry" belong to the latest answer only; retry asks the question above it again.
export function agentFor(messages: ChatMessage[], item: ChatMessage, sending: boolean, ask: (q: string) => void): Agent | undefined {
  if (item.role !== "assistant") return undefined;
  const i = messages.indexOf(item);
  const question = [...messages.slice(0, i)].reverse().find((m) => m.role === "user")?.content ?? "";
  return { interactive: i === messages.length - 1 && !sending, onAsk: ask, onRetry: () => question && ask(question) };
}
