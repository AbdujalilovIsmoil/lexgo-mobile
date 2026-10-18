import { askInstructor, useInstructorSession, type ChatBody } from "@/entities/instructor";
import { ApiError } from "@/shared/api";
import { currentPath, targetDecls, usePathStore, visibleTargets } from "@/shared/instructor";
import { errorHaptic, tapHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { crossTargets } from "../lib/catalog";
import { errText } from "../lib/errText";
import { isLauncherTarget, selfHelpAsked } from "../lib/selfHelp";
import { msgId, useInstructorChat } from "./chatStore";
import { deliver } from "./deliver";
import { abortRun } from "./runner/context";
import { useInstructorUi } from "./uiStore";

const unknownSession = (e: unknown) => e instanceof ApiError && (e.status === 404 || e.status === 410) && /session/i.test(`${e.code ?? ""} ${e.detail ?? ""} ${JSON.stringify(e.data)}`);

// One question → POST /ai/instructor/chat with the screen's path and visible targets (TZ 9) → answer + commands.
export async function sendToInstructor(text: string, locale: string): Promise<void> {
  const question = text.trim();
  const chat = useInstructorChat.getState();
  if (!question || chat.sending) return;
  tapHaptic();
  abortRun("superseded");
  const history = chat.messages.filter((m) => !m.failed).slice(-6).map((m) => ({ role: m.role, content: m.text.slice(0, 300) }));
  const userId = msgId();
  chat.add({ id: userId, role: "user", text: question });
  chat.setSending(true);
  useInstructorUi.getState().touch();
  try {
    // The assistant never lists its own button / composer unless the question is about the assistant itself.
    const self = selfHelpAsked(question);
    const seen = (await visibleTargets()).filter((v) => !v.id.startsWith("ai-instructor:") && (self || !isLauncherTarget(v.id)));
    const sid = useInstructorSession.getState().sessionId;
    const body: ChatBody = { message: question, locale, current_path: currentPath(), visible_targets: seen.map((v) => v.id), targets: [...targetDecls(seen), ...crossTargets(usePathStore.getState().role, new Set(seen.map((v) => v.id)))].slice(0, 120), history, ...(sid ? { session_id: sid } : {}) };
    const reply = await askInstructor(body).catch((e: unknown) => {
      if (!sid || !unknownSession(e)) throw e;
      useInstructorSession.getState().clear(); // the backend forgot the session: start a fresh one
      return askInstructor({ ...body, session_id: undefined });
    });
    useInstructorSession.getState().set(reply.sessionId);
    deliver(reply, question);
  } catch (e) {
    useInstructorChat.getState().patch(userId, { failed: true });
    errorHaptic();
    toast(errText(e), "err");
  } finally {
    useInstructorChat.getState().setSending(false);
  }
}
