import { AppState } from "react-native";
import type { ReconnectingSocket } from "./ReconnectingSocket";

// For a socket nobody needs while the app is away (the AI chat, an open chat room — not the user socket, which raises the background
// alerts, nor a call): closed after `graceMs` in the background, where its ping every 25 s only keeps the radio awake, and started again
// on return, where its onOpen(again) re-reads what was missed. A quick switch to another app and back keeps it open.
export function closeWhileAway(sock: ReconnectingSocket, graceMs = 30_000): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let asleep = false;
  const sub = AppState.addEventListener("change", (s) => {
    clearTimeout(timer);
    if (s === "background") timer = setTimeout(() => { asleep = true; sock.stop(); }, graceMs);
    else if (s === "active" && asleep) { asleep = false; sock.start(); }
  });
  return () => { clearTimeout(timer); sub.remove(); };
}
