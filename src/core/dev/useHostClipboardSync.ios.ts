import { useEffect } from "react";
import { AppState } from "react-native";
import * as Clipboard from "expo-clipboard";
import getDevServer from "expo/src/async-require/getDevServer";

const POLL_MS = 1000;

// Dev builds only. The iOS simulator often does not get the Mac's clipboard
// (DeviceHub's pasteboard sync can stall), so Cmd+V / "Paste" has nothing to
// paste. While the app is in the foreground this asks the dev server
// (metro.config.js, loopback only) for the Mac clipboard and copies changes into
// the simulator's own pasteboard. On a real device localhost is the phone itself,
// so the request just fails and nothing happens. Opt out with EXPO_PUBLIC_SYNC_HOST_CLIPBOARD=0.
export function useHostClipboardSync(): void {
  useEffect(() => {
    if (!__DEV__ || process.env.EXPO_PUBLIC_SYNC_HOST_CLIPBOARD === "0") return;
    const dev = getDevServer();
    if (!dev.bundleLoadedFromServer) return;
    // The server only answers loopback, so a LAN-IP bundle URL (403) is rewritten to localhost on the same port.
    const origin = `http://localhost:${/:(\d+)/.exec(dev.url.replace(/^\w+:\/\//, ""))?.[1] ?? "8081"}`;
    let last: string | null = null;
    let stopped = false;
    const tick = async () => {
      if (stopped || AppState.currentState !== "active") return;
      try {
        const res = await fetch(`${origin}/__host_clipboard`, { headers: { Accept: "text/plain" } });
        if (!res.ok) return;
        const text = await res.text();
        if (text && text !== last) {
          last = text;
          await Clipboard.setStringAsync(text);
        }
      } catch {
        /* dev server not reachable right now */
      }
    };
    void tick();
    const timer = setInterval(() => void tick(), POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);
}
