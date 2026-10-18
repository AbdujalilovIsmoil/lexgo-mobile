import { useState } from "react";
import { ApiError } from "@/shared/api";
import { confirmDialog, toast } from "@/shared/ui";
import { openUrl } from "@/shared/lib/links";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { cancelOrder, startTelegramLink, type AssistInfo } from "@/entities/support";
import { useAssistStore } from "./assistStore";

const fail = (e: unknown, fallback: string) => (e instanceof ApiError && e.detail ? e.detail : fallback);

// The two real writes a client has on an assist card: link Telegram (so the approval request can
// reach them) and decline an unpaid marketplace order that an operator opened for them.
export function useAssistActions(card: AssistInfo | null) {
  const { t } = useT();
  const [busy, setBusy] = useState<"" | "link" | "decline">("");
  const linkTelegram = async () => {
    setBusy("link");
    try {
      const url = await startTelegramLink();
      if (url) openUrl(url);
      else toast(t("sp7.linkFailed"), "err");
    } catch (e) {
      toast(fail(e, t("sp7.linkFailed")), "err");
    } finally {
      setBusy("");
    }
  };
  const decline = () => {
    if (!card) return;
    confirmDialog({
      title: t("sp7.declineTitle"), message: t("sp7.declineText"), confirmLabel: t("sp7.declineDo"), cancelLabel: t("sp7.keep"), icon: "x-circle", danger: true,
      onConfirm: async () => {
        setBusy("decline");
        try {
          await cancelOrder(card.targetId, "client declined the operator's offer");
          useAssistStore.getState().settle(card.kind, "rejected", [card.targetId]);
          successHaptic();
          toast(t("sp7.declined"), "ok");
        } catch (e) {
          errorHaptic();
          toast(fail(e, t("sp7.declineFailed")), "err");
        } finally {
          setBusy("");
        }
      },
    });
  };
  return { busy, linkTelegram, decline };
}
