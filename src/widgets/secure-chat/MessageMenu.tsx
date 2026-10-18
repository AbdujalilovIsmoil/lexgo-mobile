import * as Clipboard from "expo-clipboard";
import { ActionList, type ActionItem } from "@/shared/ui/admin";
import { toast } from "@/shared/ui";
import { openFile, HIDDEN, type Msg } from "@/entities/secure-chat";
import { useT } from "@/shared/i18n";

type Props = { msg: Msg | null; onClose: () => void; onReply: (m: Msg) => void; onRetry: (id: string) => void; onDiscard: (id: string) => void };

// Long-press menu of a message: reply, copy, share the attachment — or retry / discard a failed or stuck send.
// There is no edit / delete here on purpose: the backend has no such endpoint and sends no can_edit / can_delete flag.
export function MessageMenu({ msg, onClose, onReply, onRetry, onDiscard }: Props) {
  const { t } = useT();
  const actions: ActionItem[] = [];
  if (msg?.failed) {
    actions.push({ key: "retry", icon: "refresh-cw", label: t("admChat.retry"), onPress: () => onRetry(msg.id) }, { key: "drop", icon: "trash-2", label: t("admChat.discard"), danger: true, onPress: () => onDiscard(msg.id) });
  } else if (msg?.pending) {
    actions.push({ key: "cancel", icon: "x-circle", label: t("ms4.cancelSend"), danger: true, onPress: () => onDiscard(msg.id) });
  } else if (msg) {
    actions.push({ key: "reply", icon: "corner-up-left", label: t("admChat.reply"), onPress: () => onReply(msg) });
    if (msg.content && msg.content !== HIDDEN && !msg.file) actions.push({ key: "copy", icon: "copy", label: t("adm.copy"), onPress: () => { void Clipboard.setStringAsync(msg.content); toast(t("adm.copied"), "ok"); } });
    if (msg.file) actions.push({ key: "share", icon: "share", label: t("ms4.shareFile"), onPress: () => { openFile(msg).catch(() => toast(t("admChat.fileFailed"), "err")); } });
  }
  return <ActionList visible={!!msg && actions.length > 0} onClose={onClose} title={t("admChat.message")} actions={actions} />;
}
