import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type Report = { ok: number; fail: number; stopped: boolean; done: number; total: number };

// Toast for a finished send; returns true when everything went out, so the form can clear itself.
export function useReport() {
  const { t } = useT();
  return (r: Report): boolean => {
    if (r.stopped) toast(t("admNtfC.stopped", { done: r.done, total: r.total }), r.fail ? "err" : "info");
    else if (r.fail) toast(t("admNtfC.resultPartial", { ok: r.ok, fail: r.fail }), "err");
    else toast(t("admNtfC.resultOk", { n: r.ok }), "ok");
    return !r.fail && !r.stopped;
  };
}
