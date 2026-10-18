import { getMessages } from "@/entities/chat";
import { useChatStore } from "./chatStore";

const live = () => useChatStore.getState();
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
// An answer can take ~70 s and iOS drops an idle request after 60 s: poll the server's final state.
const STEPS_MS = [3000, 5000, 8000, 12_000, 18_000, 25_000, 35_000, 45_000];

// Runs until the answer shows up (socket or poll), the user moves to another chat, or the steps run out.
export async function recover(clientId: string, chatId: string, sid: number): Promise<void> {
  for (const ms of STEPS_MS) {
    await sleep(ms);
    if (live().session !== sid || !live().sending) return;
    try {
      live().merge(await getMessages(clientId, chatId));
    } catch {
      /* keep polling */
    }
  }
}
