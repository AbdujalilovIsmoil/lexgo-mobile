import { useInstructorSession } from "@/entities/instructor";
import { useInstructorChat } from "./chatStore";
import { abortRun } from "./runner/context";
import { resetRuntimeSync } from "./runtimeSync";

// A fresh conversation: stop whatever is running, forget the backend session and the local messages.
export function newInstructorChat(): void {
  abortRun("new_chat");
  useInstructorChat.getState().clear();
  useInstructorSession.getState().clear();
  resetRuntimeSync();
}
