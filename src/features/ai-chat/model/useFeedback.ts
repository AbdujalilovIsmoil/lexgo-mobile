import { useCallback, useState } from "react";
import { sendFeedback } from "@/entities/chat";
import { useT } from "@/shared/i18n";
import { successHaptic } from "@/shared/lib/haptics";
import { toast, useErrorText } from "@/shared/ui";
import { useChatStore } from "./chatStore";

// 👍 sends at once; 👎 asks for an optional comment first (it lands in the lawyer-moderator queue on the server).
export function useFeedback() {
  const { t } = useT();
  const errText = useErrorText();
  const [target, setTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = useCallback(
    async (id: string, useful: boolean, comment = "") => {
      setBusy(true);
      try {
        await sendFeedback(id, useful, comment.trim());
        useChatStore.getState().setFeedback(id, useful ? "up" : "down");
        successHaptic();
        toast(t("ax1.feedbackThanks"), "ok");
        setTarget(null);
      } catch (e) {
        toast(errText(e), "err");
      } finally {
        setBusy(false);
      }
    },
    [t, errText],
  );

  return { target, busy, askWhy: setTarget, submit, close: () => setTarget(null) };
}
