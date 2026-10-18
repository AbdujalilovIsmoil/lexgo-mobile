import { useState } from "react";
import type { UserHit } from "@/entities/admin-users";
import { confirmDialog, toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useReport } from "./useReport";
import { useSender, type Compose, type Recipient } from "./useSender";

export type Mode = "individual" | "broadcast";
const EMPTY: Compose = { channel: "push", category: "system", title: "", body: "" };
const MANY = 5; // more people than this need a confirmation

// The whole "send notification" screen state: mode, recipients / role, message, and the guarded submit (+ retry of failures).
export function useNotifyForm() {
  const { t } = useT();
  const sender = useSender();
  const report = useReport();
  const [mode, setMode] = useState<Mode>("individual");
  const [selected, setSelected] = useState<UserHit[]>([]);
  const [manualId, setManualId] = useState("");
  const [role, setRole] = useState("client");
  const [compose, setCompose] = useState<Compose>(EMPTY);
  const msg = { ...compose, title: compose.title.trim(), body: compose.body.trim() };

  const people = (): Recipient[] => {
    const list = selected.map((u) => ({ id: u.id, name: u.name || u.phone || u.lexgoId }));
    const m = manualId.trim();
    return m && !list.some((p) => p.id === m) ? [...list, { id: m, name: m }] : list;
  };
  const clear = () => setCompose({ ...compose, title: "", body: "" });
  const run = async (list: Recipient[], keep: NonNullable<typeof sender.summary>["results"] = []) => {
    if (report(await sender.toPeople(list, msg, keep))) { clear(); setSelected([]); setManualId(""); }
  };

  const submit = async () => {
    if (!msg.title || !msg.body) return toast(t("admNtf.fillFields"), "err");
    if (mode === "broadcast") {
      const name = t(`admNtf.roles.${role}`);
      return confirmDialog({
        title: t("admNtfB.broadcastTitle"), message: t("admNtfB.broadcastConfirm", { role: name }), confirmLabel: t("admNtf.send"), cancelLabel: t("adm.cancel"), icon: "send", danger: true,
        onConfirm: async () => { if (report(await sender.toRole(role, name, msg))) clear(); },
      });
    }
    const list = people();
    if (!list.length) return toast(t("admNtfB.noRecipients"), "err");
    if (list.length <= MANY) return run(list);
    confirmDialog({ title: t("admNtfB.manyTitle", { n: list.length }), message: t("admNtfB.manyConfirm", { n: list.length }), confirmLabel: t("admNtf.send"), cancelLabel: t("adm.cancel"), icon: "send", onConfirm: () => run(list) });
  };

  const all = sender.summary?.results ?? [];
  const failed = mode === "individual" ? all.filter((r) => !r.ok).map(({ id, name }) => ({ id, name })) : [];
  const retry = () => (msg.title && msg.body ? run(failed, all.filter((r) => r.ok)) : toast(t("admNtf.fillFields"), "err"));
  const count = mode === "broadcast" ? 0 : people().length;

  return { mode, setMode, selected, setSelected, manualId, setManualId, role, setRole, compose, setCompose, submit, retry, failed: failed.length, count, sending: !!sender.progress, progress: sender.progress, summary: sender.summary, stop: sender.stop };
}
