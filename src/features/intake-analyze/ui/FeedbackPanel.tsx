import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { sendIntakeFeedback } from "@/entities/intake";
import { ApiError } from "@/shared/api";
import { Icon, Text, toast } from "@/shared/ui";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { FeedbackChoice } from "./FeedbackChoice";

type Vote = "" | "yes" | "no";

// "Javob foydali bo'ldimi?" → POST /ai/feedback {useful, comment, request_id: leadId}; "not useful" also lands in the
// lawyer-moderator queue. The vote shows a spinner, a failure is a toast and can be retried, a success turns the
// panel into a thank-you that pops in (the answer to "no" says it went to the moderator).
export function FeedbackPanel({ requestId }: { requestId: string }) {
  const c = useColors();
  const { t } = useT();
  const [sent, setSent] = useState<Vote>("");
  const [busy, setBusy] = useState<Vote>("");
  const send = async (useful: boolean) => {
    if (busy || sent) return;
    setBusy(useful ? "yes" : "no");
    try {
      await sendIntakeFeedback(useful, requestId);
      successHaptic();
      setSent(useful ? "yes" : "no");
    } catch (e) {
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"), "err");
    } finally {
      setBusy("");
    }
  };
  if (sent) {
    return (
      <Animated.View entering={ZoomIn.springify().damping(15)} style={[s.box, s.done, { backgroundColor: c.okBg }]}>
        <View style={[s.tile, { backgroundColor: c.surface }]}><Icon name={sent === "yes" ? "check-circle" : "shield"} size={18} color={c.ok} /></View>
        <Text variant="small" style={s.flex}>{t(sent === "yes" ? "cxIn.feedbackThanks" : "cxIn.feedbackQueued")}</Text>
      </Animated.View>
    );
  }
  return (
    <View style={[s.box, { backgroundColor: c.surface2 }]}>
      <Text variant="small" weight="semibold">{t("cxIn.feedbackAsk")}</Text>
      <View style={s.row}>
        <FeedbackChoice icon="thumbs-up" label={t("cxIn.feedbackYes")} tone="ok" busy={busy === "yes"} disabled={!!busy} onPress={() => void send(true)} />
        <FeedbackChoice icon="thumbs-down" label={t("cxIn.feedbackNo")} tone="err" busy={busy === "no"} disabled={!!busy} onPress={() => void send(false)} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 12, padding: 14, borderRadius: 18 },
  row: { flexDirection: "row", gap: 10 },
  done: { flexDirection: "row", alignItems: "center", gap: 10 },
  tile: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
});
