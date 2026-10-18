import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { ComposeForm } from "@/features/admin-notify";
import { RecipientsCard } from "@/features/cc-notify";
import { ResultsCard, SendStatus } from "@/widgets/admin-notify";
import { AdminPage } from "@/shared/ui/admin";
import { Button, Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { useCcNotifyForm } from "./model/useCcNotifyForm";

// /cc/notify: the operator sends a notification to chosen clients (push / Telegram / e-mail / SMS) and sees the delivery
// of each. `to` / `name` params pre-select the client the operator came from.
export default function CcNotifyPage() {
  const { t } = useT();
  const insets = useInsets();
  const { to, name } = useLocalSearchParams<{ to?: string; name?: string }>();
  const f = useCcNotifyForm(to ? { id: String(to), name: name ? String(name) : String(to) } : null);
  return (
    <AdminPage title={t("cc1.tools.notify")} subtitle={t("cc3.sub")}>
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 14 }}>
        <RecipientsCard picked={f.picked} onToggle={f.toggle} onRemove={f.remove} />
        <ComposeForm value={f.compose} onChange={f.setCompose} />
        <Text variant="caption" tone="gray">{t("admNtf.categoryNote")}</Text>
        {f.progress ? <SendStatus progress={f.progress} onStop={f.stop} /> : null}
        <View><Button title={f.sending ? t("admNtf.sending") : t("admNtf.send")} icon="send" variant="gradient" full loading={f.sending} onPress={f.submit} /></View>
        {f.summary?.results.length ? <ResultsCard summary={f.summary} /> : null}
      </KeyboardAwareScrollView>
    </AdminPage>
  );
}
