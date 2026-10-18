import { fetchSession, useInstructorSession } from "@/entities/instructor";
import { ApiError } from "@/shared/api";
import { useInstructorChat } from "./chatStore";
import { deliver } from "./deliver";

// Reopening the assistant after an app restart: the backend still has the session and its last answer.
export async function restoreInstructor(): Promise<void> {
  const store = useInstructorSession.getState();
  await store.hydrate();
  const sid = useInstructorSession.getState().sessionId;
  if (!sid || useInstructorChat.getState().messages.length) return;
  try {
    const last = await fetchSession(sid);
    if (last && !useInstructorChat.getState().messages.length) deliver({ ...last, commands: [] }, "", false);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 410)) useInstructorSession.getState().clear();
  }
}
