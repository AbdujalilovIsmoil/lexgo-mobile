import { ChatSocketHost } from "@/features/ai-chat";
import { InstructorHost } from "@/widgets/instructor";

// App-level mount point of the Ai package: the AI legal chat's socket (answers keep arriving whichever tab
// is in front) and the AI Instructor (floating button, sheet, highlight overlay, runtime sync).
export function AiMounts() {
  return (
    <>
      <ChatSocketHost />
      <InstructorHost />
    </>
  );
}
