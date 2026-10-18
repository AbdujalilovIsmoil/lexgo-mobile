import { CLIENT_TOPICS, useSupportMeta } from "@/entities/support";

/** Topics to pick from: the app's list plus any extra category the backend's /support/meta announces. */
export function useTopics(): string[] {
  const extra = (useSupportMeta().data?.categories ?? []).map((o) => o.key).filter((k) => k !== "general" && k !== "documents" && !(CLIENT_TOPICS as readonly string[]).includes(k));
  return [...CLIENT_TOPICS, ...extra];
}
