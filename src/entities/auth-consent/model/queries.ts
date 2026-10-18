import { useQuery } from "@tanstack/react-query";
import { useT } from "@/shared/i18n";
import { getConsent, listConsents } from "../api/consentApi";
import { signupDocs } from "../lib/signupDocs";

// Sign-up documents of the chosen account type. Failing to load never blocks registration.
export function useSignupConsents(role: string) {
  const { locale } = useT();
  const q = useQuery({ queryKey: ["auth-consents", locale], queryFn: () => listConsents(locale), staleTime: 10 * 60_000 });
  return { ...q, docs: signupDocs(q.data ?? [], role) };
}

export function useConsentDetail(id: string | null) {
  const { locale } = useT();
  return useQuery({ queryKey: ["auth-consent", id, locale], queryFn: () => getConsent(id ?? "", locale), enabled: !!id, staleTime: 10 * 60_000 });
}
