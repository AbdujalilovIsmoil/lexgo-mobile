import { StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { useColors } from "@/shared/theme";
import { useIsAuthed } from "@/entities/session";
import { OtpForm, useOtpFlow } from "@/features/auth";
import { AuthHero } from "@/widgets/auth-hero";
import { useT } from "@/shared/i18n";
import { maskPhone } from "@/shared/lib/phone";
import { HeroScroll } from "@/shared/ui";

// One screen for every OTP purpose; without a pending flow it bounces to login — or to Home when the person is already signed in
// (the flow is dropped the moment a session is issued, while this screen is still closing).
export function OtpPage() {
  const c = useColors();
  const { t } = useT();
  const flow = useOtpFlow((s) => s.flow);
  const authed = useIsAuthed();
  if (!flow) return <Redirect href={authed ? "/" : "/auth/login"} />;
  const title = flow.purpose === "login2fa" ? t("auth.twoFaTitle") : flow.purpose === "reset" ? t("au3.codeTitle") : t("auth.otpTitle");
  const phone = maskPhone(flow.phone);
  const subtitle = flow.totp ? t("auth.otpTotp") : t(flow.purpose === "reset" ? "au3.resetSub" : "auth.otpSub", { phone });
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <HeroScroll keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <AuthHero title={title} subtitle={subtitle} />
        <View style={s.body}>
          <OtpForm />
        </View>
      </HeroScroll>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: 40 },
  body: { paddingHorizontal: 16, paddingTop: 28 },
});
