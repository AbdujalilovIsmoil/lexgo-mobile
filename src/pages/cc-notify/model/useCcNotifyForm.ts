import { useState } from "react";
import { useSender, type Compose } from "@/features/admin-notify";
import { useRecipients, type Picked } from "@/features/cc-notify";
import { confirmDialog, toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const EMPTY: Compose = { channel: "push", category: "system", title: "", body: "" };

// State of the operator's "send a notification" screen: recipients (clients), the message, and a confirmed send
// (one request per client; stoppable). A role-wide broadcast is not offered here — that belongs to the admin module.
export function useCcNotifyForm(first: Picked | null) {
  const { t } = useT();
  const sender = useSender();
  const people = useRecipients(first);
  const [compose, setCompose] = useState<Compose>(EMPTY);

  const run = async () => {
    const r = await sender.toPeople(people.picked, { ...compose, title: compose.title.trim(), body: compose.body.trim() });
    if (r.stopped) toast(t("admNtfC.stopped", { done: r.done, total: r.total }), r.fail ? "err" : "info");
    else if (r.fail) toast(t("admNtfC.resultPartial", { ok: r.ok, fail: r.fail }), "err");
    else {
      toast(t("admNtfC.resultOk", { n: r.ok }), "ok");
      setCompose({ ...compose, title: "", body: "" });
      people.clear();
    }
  };

  const submit = () => {
    if (!compose.title.trim() || !compose.body.trim()) return toast(t("admNtf.fillFields"), "err");
    if (!people.picked.length) return toast(t("admNtfB.noRecipients"), "err");
    confirmDialog({
      title: t("cc3.confirmTitle"), message: t("cc3.confirmText", { n: people.picked.length }), confirmLabel: t("admNtf.send"), cancelLabel: t("adm.cancel"), icon: "send",
      onConfirm: run,
    });
  };

  return { ...people, compose, setCompose, submit, sending: !!sender.progress, progress: sender.progress, summary: sender.summary, stop: sender.stop };
}
