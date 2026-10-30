import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import type { RaSession } from "@/entities/remote-assist";
import { answerRequest, requestTimedOut, useRaStore } from "@/features/remote-assist";
import { Text } from "@/shared/ui";
import { SheetActions } from "@/shared/ui/profile";
import { useInsets } from "@/shared/lib/insets";
import { radius, shadows, usePaneColor } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Fact, OperatorHead, ScopeRows, TicketFact } from "./ConsentParts";
import { modeText } from "./names";
import { useCountdown } from "./useCountdown";

/** The consent request on screen, above everything (a call, an open sheet): nothing is shared until the client answers. */
export function ConsentSheet() {
  const req = useRaStore((s) => s.request);
  const live = useRaStore((s) => !!s.session);
  return req && !live ? <Consent key={req.id} req={req} /> : null;
}

// TZ RA §8: operator and LexGo id, the ticket, the mode, the exact scopes with a switch for each optional one, the time left, what is
// never shared, that it can be paused or revoked at any time, and Accept / Deny. The Android back button does not answer for the client.
function Consent({ req }: { req: RaSession }) {
  const { t } = useT();
  const pane = usePaneColor();
  const insets = useInsets();
  const busy = useRaStore((s) => s.busy);
  const failed = useRaStore((s) => s.failed);
  const more = useRaStore((s) => s.more);
  const [off, setOff] = useState<ReadonlySet<string>>(() => new Set());
  const left = useCountdown(req.expiresAt);
  const over = left === 0;
  useEffect(() => {
    if (over) void requestTimedOut(req.id);
  }, [over, req.id]);
  const mode = modeText(t, req.mode);
  const flip = (scope: string, on: boolean) =>
    setOff((cur) => {
      const next = new Set(cur);
      if (on) next.delete(scope);
      else next.add(scope);
      return next;
    });
  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={() => undefined}>
      <View style={s.root}>
        <View style={[StyleSheet.absoluteFill, s.dim]} />
        <View style={[s.card, shadows.s2, { backgroundColor: pane, paddingBottom: insets.bottom + 14 }]} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
            <OperatorHead person={req.operator} left={left} />
            <View style={s.gap}>
              <Text variant="h3">{t("ra.askTitle")}</Text>
              <Text variant="small" tone="gray">{t("ra.askLead", { name: req.operator.name || t("ra.operator") })}</Text>
            </View>
            <TicketFact ticketId={req.ticketId} reason={req.reason} />
            <Fact icon="sliders" title={`${t("ra.modeTitle")}: ${mode.title}`} text={mode.text} />
            <ScopeRows scopes={req.requestedScopes} off={off} onFlip={flip} />
            <Fact icon="shield" title={t("ra.onlyLexgo")} text={t("ra.notShared")} />
            <Fact icon="pause-circle" title={t("ra.canStop")} strong />
            {more > 0 ? <Text variant="caption" tone="gray">{t("ra.more", { n: more })}</Text> : null}
            {failed ? <Text variant="small" tone="err" accessibilityRole="alert">{t("ra.failed")}</Text> : null}
          </ScrollView>
          <View style={s.actions}>
            <SheetActions
              cancel={{ label: t("ra.deny"), onPress: () => void answerRequest("deny", off) }}
              submit={{ label: t("ra.accept"), onPress: () => void answerRequest("accept", off), loading: busy === "accept", disabled: !!busy }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  dim: { backgroundColor: "rgba(2,10,28,0.62)" },
  card: { maxHeight: "92%", borderTopLeftRadius: radius.rx, borderTopRightRadius: radius.rx, paddingTop: 20, width: "100%", maxWidth: 560, alignSelf: "center" },
  body: { paddingHorizontal: 20, paddingBottom: 14, gap: 14 },
  gap: { gap: 6 },
  actions: { paddingHorizontal: 20, paddingTop: 6 },
});
