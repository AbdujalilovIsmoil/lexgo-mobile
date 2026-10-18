import { useAssistListener } from "@/features/support";
import { AssistSheet } from "./AssistSheet";

// Mounted once in core: listens for operator actions on the client's behalf and shows their preview.
export function AssistHost() {
  useAssistListener();
  return <AssistSheet />;
}
