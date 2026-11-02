import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { useSession } from "@/entities/session";
import { useLocaleStore } from "@/shared/i18n";
import { onBackOnline } from "@/shared/network";
import { getConfig, register, sendBatch, sendOne } from "../api/usageApi";
import { UsageEngine } from "../model/engine";
import { loadPersisted, newId, registrationFor, savePersisted } from "../lib/runtime";

// One engine per app process. Kept on globalThis so a code reload in development (which re-runs this module) replaces the old engine
// instead of leaving it running beside the new one with its own heartbeat timer.
const G = globalThis as { __lexgoUsageEngine?: UsageEngine };
G.__lexgoUsageEngine?.dispose();
G.__lexgoUsageEngine = undefined;
const getEngine = (): UsageEngine =>
  (G.__lexgoUsageEngine ??= new UsageEngine({
    now: () => Date.now(),
    uuid: newId,
    load: loadPersisted,
    save: savePersisted,
    api: { config: getConfig, register, send: sendOne, batch: sendBatch },
    setTimer: (fn, ms) => setTimeout(fn, ms),
    clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
    platform: Platform.OS,
  }));

// Play test usage analytics (Android only, invisible): the whole app's foreground / background (React Native's AppState is the
// application-level lifecycle — moving between screens never opens a new session), the signed-in tester (registration on sign-in, user
// change, app update, locale change) and the connection coming back (the queue is flushed). No screen, no permission, no notification.
export function UsageTestMount() {
  const user = useSession()?.user;
  const locale = useLocaleStore((s) => s.locale);
  const uid = user?.id ?? "";

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const e = getEngine();
    if (AppState.currentState === "active") void e.foreground();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") void e.foreground();
      else if (s === "background") void e.background();
    });
    const off = onBackOnline(() => e.online());
    return () => { sub.remove(); off(); };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    let live = true;
    if (!uid) { void getEngine().setAccount(null); return; }
    void registrationFor(locale).then((registration) => { if (live) void getEngine().setAccount({ userId: uid, registration }); }).catch(() => undefined);
    return () => { live = false; };
  }, [uid, locale]);

  return null;
}
