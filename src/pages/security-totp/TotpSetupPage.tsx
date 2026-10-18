import { useEffect, useRef } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { TotpSetupBody } from "@/widgets/security";
import { useTotpEnable } from "@/features/security";
import { AdminPage } from "@/shared/ui/admin";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// /security/totp — connect an authenticator app. The secret is requested when the page opens and 2FA
// counts as enabled only after the server accepted the first code; then back to the security screen.
export default function TotpSetupPage() {
  const { t } = useT();
  const router = useRouter();
  const insets = useInsets();
  const flow = useTotpEnable(() => router.back());
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void flow.start();
  }, [flow]);
  return (
    <AdminPage title={t("admSec.totpTitle")}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TotpSetupBody flow={flow} />
      </ScrollView>
    </AdminPage>
  );
}
