import { useCallback } from "react";
import type { AuthErr } from "@/entities/session";
import { useT } from "@/shared/i18n";

export type AuthCtx = "login" | "otp" | "register";

// Readable text of an auth failure. Uzbek users get the server's own wording (it is Uzbek only);
// ru/en get a translated line per kind, and the raw server text only when the kind is unknown.
export function useAuthText() {
  const { t, locale } = useT();
  return useCallback(
    (e: AuthErr, ctx: AuthCtx): string => {
      const server = locale === "uz" ? e.message : "";
      switch (e.kind) {
        case "offline": return t("common.offline");
        case "rate": return server || t("au2.rate");
        case "blocked": return server || t("au2.blocked");
        case "expired": return t("auth.expired");
        case "wrong": return ctx === "login" ? t("auth.failed") : ctx === "register" ? e.message || t("common.serverError") : t("auth.incorrect");
        case "exists": return t("au1.phoneExists");
        case "channel": return t("admSec.channelDown");
        case "validation": return e.fields.password ? t("auth.passwordHint") : e.fields.phone ? t("auth.invalidPhone") : t("au2.invalid");
        case "server": return t("common.serverError");
        case "webOnly": return t("au4.webOnly.text");
        default: return e.message || t("common.serverError");
      }
    },
    [t, locale],
  );
}
