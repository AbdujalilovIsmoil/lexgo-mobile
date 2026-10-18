import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { ComposeForm, useNotifyForm, type Mode } from "@/features/admin-notify";
import { BroadcastCard, NotifyHero, NotifyPreview, RecipientsCard, ResultsCard, SendStatus } from "@/widgets/admin-notify";
import { AdminPage, KeyboardLift } from "@/shared/ui/admin";
import { Button, Segmented, Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Admin sends a notification: to hand-picked people (one request each) or to a whole role (one request).
// The send button sits in a bar under the scroll so it is always under the thumb.
export default function AdminNotifyPage() {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const f = useNotifyForm();
  const modes: { value: Mode; label: string }[] = [{ value: "individual", label: t("admNtfB.modeIndividual") }, { value: "broadcast", label: t("admNtfB.modeBroadcast") }];
  return (
    <AdminPage title={t("admHub.mod.notifications.title")} subtitle={t("admNtf.lead")}>
      <KeyboardLift>
        <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 14 }}>
          <Segmented options={modes} value={f.mode} onChange={f.setMode} />
          <NotifyHero mode={f.mode} count={f.count} role={f.role} compose={f.compose} />
          {f.mode === "broadcast" ? <BroadcastCard role={f.role} onChange={f.setRole} /> : <RecipientsCard selected={f.selected} onChange={f.setSelected} manualId={f.manualId} onManualId={f.setManualId} />}
          <ComposeForm value={f.compose} onChange={f.setCompose} />
          <Text variant="caption" tone="gray">{t("admNtf.categoryNote")}</Text>
          <NotifyPreview compose={f.compose} />
          {f.summary?.results.length ? <ResultsCard summary={f.summary} failed={f.failed} onRetry={() => void f.retry()} /> : null}
        </KeyboardAwareScrollView>
        <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.bg, paddingBottom: insets.bottom + 10 }]}>
          {f.progress ? <SendStatus progress={f.progress} onStop={f.stop} /> : null}
          <Button title={f.sending ? t("admNtf.sending") : t("admNtf.send")} icon="send" variant="gradient" full loading={f.sending} onPress={() => void f.submit()} />
        </View>
      </KeyboardLift>
    </AdminPage>
  );
}

const s = StyleSheet.create({ bar: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, gap: 8 } });
