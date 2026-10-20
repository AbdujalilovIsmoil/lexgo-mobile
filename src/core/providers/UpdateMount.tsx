import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { applyUpdate, checkForUpdate, updatesAvailable } from "@/shared/lib/appUpdate";

const EVERY_MS = 10 * 60_000;

// Looks for a newer JS bundle a few seconds after start and whenever the app comes back to the front (at most every ten minutes); a
// downloaded one is offered once: restart now, or on the next start. Native changes are not delivered this way: they need a new build.
export function UpdateMount() {
  const { t } = useT();
  const last = useRef(0);
  const asked = useRef(false);
  useEffect(() => {
    if (!updatesAvailable()) return;
    const run = async () => {
      if (Date.now() - last.current < EVERY_MS) return;
      last.current = Date.now();
      const s = await checkForUpdate();
      if (s !== "ready" || asked.current) return;
      asked.current = true;
      confirmDialog({ title: t("upd.readyTitle"), message: t("upd.readyText"), confirmLabel: t("upd.restart"), cancelLabel: t("upd.later"), icon: "download-cloud", onConfirm: async () => { await applyUpdate(); } });
    };
    const first = setTimeout(() => void run(), 4000);
    const sub = AppState.addEventListener("change", (s) => s === "active" && void run());
    return () => { clearTimeout(first); sub.remove(); };
  }, [t]);
  return null;
}
