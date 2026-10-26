import { useCallback } from "react";
import { useRouter } from "expo-router";
import { authApi, displayName, isMobileAccount, useSessionStore, WebOnlyAccountError, type Session } from "@/entities/session";
import { flushConsents } from "@/entities/auth-consent";
import { useT } from "@/shared/i18n";
import { successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { useOtpFlow } from "./otpFlowStore";

// A session was issued (login, 2FA, registration): store it, post the consents ticked at sign-up,
// greet and leave the auth modals. Account state (pending approval …) is the gate's business. An account the app does not serve
// (organisation, staff, call-centre, sales) is not stored: its server session is closed and the form says to use the web panel.
export function useAuthFinish() {
  const { t } = useT();
  const router = useRouter();
  const signIn = useSessionStore((s) => s.signIn);
  const clear = useOtpFlow((s) => s.clear);
  return useCallback(
    async (session: Session) => {
      if (!isMobileAccount(session.user.backendRole)) {
        void authApi.logout(session.refreshToken, session.token);
        throw new WebOnlyAccountError();
      }
      await signIn(session);
      successHaptic();
      const name = displayName(session.user);
      toast(name ? t("auth.welcome", { name }) : t("au2.signedIn"), "ok");
      void flushConsents(session.user.phone);
      // Leave the auth screens first, and only then drop the pending OTP flow: the OTP screen without a flow redirects to login,
      // so clearing it while that screen is still on top sent a freshly signed-in person back to the login form.
      // The way out always ends on Home (a guarded page may have opened the login, and "back" could be anywhere).
      if (router.canDismiss()) router.dismissAll();
      router.replace("/");
      clear();
    },
    [signIn, clear, router, t],
  );
}
