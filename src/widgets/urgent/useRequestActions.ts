import { useState } from "react";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { canCancel, canComplete, claimMode, isAdvocateOn, isFinal, isGroupKind, isOpen, joinable, statusChoices, useClaim, type Scope, type UrgentRequest } from "@/entities/urgent";
import { useUrgentNav } from "@/features/urgent-manage";
import { confirmDialog, toast, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type Panel = "" | "group" | "complete" | "transfer" | "cancel" | "status" | "chatEnd" | "cancelOwn";
export type Action = { key: string; icon: IconName; label: string; primary?: boolean; soft?: boolean; loading?: boolean; run: () => void };

// Every button of a record, decided by the backend's lifecycle / flags and by who is looking (TZ 3.2, 6.2).
// `manage` = call-center console, a pool item opened by a call-center lawyer, or any viewer the server marks can_manage; a plain advocate only joins, chats and ends a group chat.
export function useRequestActions(req: UrgentRequest, scope: Scope, pool = false) {
  const { t } = useT();
  const { isFullAdmin } = useAccess();
  const meId = useSession()?.user.id ?? "";
  const nav = useUrgentNav();
  const claim = useClaim(() => toast(t("ug10.taken"), "err"));
  const [panel, setPanel] = useState<Panel>("");
  const manage = scope === "cc" || pool || req.canManage;
  const mode = manage ? claimMode(req, meId, isFullAdmin) : "";
  const live = !isFinal(req) && !isOpen(req);
  const groupChat = isGroupKind(req) && req.channel === "chat" && !!req.roomId && live;
  const takeOver = () =>
    confirmDialog({ title: t("ug6.takeOver"), message: t("ug6.takeOverAsk"), confirmLabel: t("ug6.takeOver"), cancelLabel: t("adm.cancel"), icon: "repeat", onConfirm: async () => { await claim.mutateAsync(req.id); } });
  const all: (Action | false)[] = [
    joinable(req) && { key: "join", icon: req.callChannel === "audio" ? "phone" : "video", label: t("ug5.join"), primary: true, run: () => nav.join(req) },
    !!mode && { key: "claim", icon: "check", label: t(mode === "claim" ? "ug6.claim" : "ug6.takeOver"), primary: !joinable(req), loading: claim.isPending, run: () => (mode === "claim" ? claim.mutate(req.id) : takeOver()) },
    !!req.roomId && { key: "chat", icon: "message-circle", label: t("ug5.openChat"), run: () => nav.openChat(req) },
    manage && live && req.channel !== "chat" && { key: "meet", icon: "video", label: t("ug6.startMeeting"), loading: nav.meetingId === req.id, run: () => nav.startMeeting(req) },
    manage && isGroupKind(req) && !isFinal(req) && { key: "group", icon: "users", label: t(req.groupLawyers.length ? "ug9.regroup" : "ug9.assign"), run: () => setPanel("group") },
    groupChat && (manage || isAdvocateOn(req, meId)) && { key: "chatEnd", icon: "check-circle", label: t("ug8.chatEnd"), run: () => setPanel("chatEnd") },
    manage && canComplete(req) && { key: "complete", icon: "check-circle", label: t("ug8.complete"), run: () => setPanel("complete") },
    manage && live && { key: "transfer", icon: "repeat", label: t("ug8.transfer"), run: () => setPanel("transfer") },
    manage && statusChoices(req, meId).length > 0 && { key: "status", icon: "shuffle", label: t("ug8.moveTo"), run: () => setPanel("status") },
    manage && canCancel(req) && { key: "cancel", icon: "x-circle", label: t("ug8.cancel"), soft: true, run: () => setPanel("cancel") },
    scope === "client" && canCancel(req) && { key: "cancelOwn", icon: "x-circle", label: t("ug3.cancelTitle"), soft: true, run: () => setPanel("cancelOwn") },
  ];
  return { actions: all.filter((a): a is Action => !!a), panel, setPanel, meId };
}
