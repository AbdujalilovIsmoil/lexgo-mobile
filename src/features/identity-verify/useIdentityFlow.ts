import { useState } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, isRateLimited } from "@/shared/api";
import { identityKey, identityStart, identityVerifyDemo, type IdentityProvider } from "@/entities/identity";
import { useNow } from "@/shared/lib/pay/useNow";
import { useT } from "@/shared/i18n";

type Flow = { state: string; provider: IdentityProvider };

// OneID / MyID: start (POST /identity/start) opens the provider page in the in-app browser;
// a staging demo provider answers with a state and the user types the code (POST /identity/verify-demo).
export function useIdentityFlow() {
  const { t } = useT();
  const qc = useQueryClient();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);
  const [until, setUntil] = useState(0);
  const now = useNow(until > 0);
  const wait = Math.max(0, Math.ceil((until - now) / 1000));
  const fail = (e: unknown) => {
    if (isRateLimited(e)) setUntil(Date.now() + ((e as ApiError).retryAfter ?? 60) * 1000);
    const st = e instanceof ApiError ? e.status : 0;
    setNote({ ok: false, msg: st === 503 ? t("cpr.idUnavailable") : isRateLimited(e) ? t("cpr.idRate") : t("cpr.idError") });
  };
  const refresh = () => qc.invalidateQueries({ queryKey: identityKey });
  const run = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try { await fn(); } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const start = (p: IdentityProvider) => run(async () => {
    const r = await identityStart(p, Linking.createURL("/"));
    if (r.mode === "redirect") {
      setNote({ ok: true, msg: t("cpr.idRedirecting", { provider: p === "myid" ? "MyID" : "OneID" }) });
      await WebBrowser.openBrowserAsync(r.authUrl);
      await refresh();
    } else if (r.state) setFlow({ state: r.state, provider: p });
    else setNote({ ok: false, msg: t("cpr.idError") });
  });
  const verify = (code: string) => flow && run(async () => {
    const r = await identityVerifyDemo(flow.provider, flow.state, code.trim());
    if (r.verified) { setFlow(null); setNote({ ok: true, msg: t("cpr.idDone") }); await refresh(); } else setNote({ ok: false, msg: t("cpr.idFailed") });
  });
  return { flow, busy, note, wait, start, verify, refresh, cancel: () => { setFlow(null); setNote(null); } };
}
