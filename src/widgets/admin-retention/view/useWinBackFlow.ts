import { useState } from "react";
import { useWinBack, type AtRiskClient } from "@/entities/admin-dash";
import { confirmDialog, toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const keyOf = (c: AtRiskClient): string => c.id || c.phone;

// Win-back for one client or for everybody still waiting: remembers who is queued (so nobody is added twice),
// demo data never calls the server, and "all" runs one by one with a confirmation first.
export function useWinBackFlow(demo: boolean) {
  const { t } = useT();
  const add = useWinBack();
  const [done, setDone] = useState<string[]>([]);
  const [busy, setBusy] = useState("");
  const one = async (c: AtRiskClient): Promise<boolean> => {
    if (demo) { toast(t("admRet.demoAction"), "info"); return false; }
    if (!c.id && !c.phone) { toast(t("admRet.noClientId"), "err"); return false; }
    setBusy(keyOf(c));
    try {
      await add.mutateAsync(c);
      setDone((d) => [...d, keyOf(c)]);
      return true;
    } catch {
      return false;
    } finally {
      setBusy("");
    }
  };
  const all = (list: AtRiskClient[]) => {
    const todo = list.filter((c) => !done.includes(keyOf(c)));
    if (demo) return toast(t("admRet.demoAction"), "info");
    confirmDialog({
      title: t("admRetV.allTitle"), message: t("admRetV.allAsk", { n: todo.length }), confirmLabel: t("admRetV.allConfirm"), cancelLabel: t("adm.cancel"), icon: "rotate-ccw",
      onConfirm: async () => { let ok = 0; for (const c of todo) if (await one(c)) ok += 1; toast(t("admRetV.allDone", { n: ok }), ok ? "ok" : "err"); },
    });
  };
  return { done, busy, one, all, keyOf };
}
