import { useState } from "react";
import { useAppForm } from "@/shared/form";
import { ApiError } from "@/shared/api";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useSession } from "@/entities/session";
import { contactBlocked, guessCategory, useCreateTicket } from "@/entities/support";
import { useAiStore } from "./aiStore";
import { ticketSchema } from "./ticketSchema";
import { handoffTurns } from "./handoff";
import { useSupportAi } from "./useSupportAi";
import { useTopics } from "./useTopics";

// State and submit of the new-chat form. The AI turns of this session travel with the ticket as context.
export function useNewTicket(initial: { message: string; topic: string }, onCreated: (ticketId: string) => void) {
  const { t } = useT();
  const topics = useTopics();
  const ai = useSupportAi();
  const create = useCreateTicket();
  const role = useSession()?.user.backendRole ?? "client";
  const form = useAppForm(ticketSchema, { message: initial.message });
  const message = form.watch("message");
  const [topic, setTopic] = useState(initial.topic);
  const [urgent, setUrgent] = useState(false);
  const auto = topic ? "" : guessCategory(message, topics);
  const err = create.error;
  const error = err ? contactBlocked(err) || (err instanceof ApiError && err.detail ? err.detail : t("sp2.failed")) : "";
  const submit = form.handleSubmit((v) => {
    const { turns, sessionId } = useAiStore.getState();
    create.mutate(
      { message: v.message, category: topic || auto, urgent, topicPicked: Boolean(topic), turns: handoffTurns(turns), aiSessionId: sessionId, role },
      { onSuccess: (tk) => { ai.clear(); toast(tk.workId ? t("sp2.created", { id: tk.workId }) : t("sp2.createdPlain"), "ok"); onCreated(tk.id); } },
    );
  });
  const reset = (i: { message: string; topic: string }) => { form.reset({ message: i.message }); setTopic(i.topic); setUrgent(false); queueMicrotask(create.reset); };
  return {
    reset, form, control: form.control, message, topic, setTopic, urgent, setUrgent, topics, auto, error, submit, ai,
    ready: message.trim().length >= 3, pending: create.isPending, shared: ai.turns.some((x) => x.state === "done"),
  };
}
