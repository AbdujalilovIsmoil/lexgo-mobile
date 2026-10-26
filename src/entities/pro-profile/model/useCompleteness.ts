import { useMemo } from "react";
import { completeness, sectionsOf } from "../lib/completeness";
import { useAccount, useMyProfile } from "./queries";

// How complete the professional's profile is — the one number the home card, the profile page and the onboarding page all show: the
// sections of TZ 31 read from GET /lawyers/me and the account (name, e-mail, photo). `ready` once both answered (or the account failed),
// so the percent does not jump while the second request is still running.
export function useProfileCompleteness() {
  const profile = useMyProfile();
  const account = useAccount();
  const sections = useMemo(() => (profile.data ? sectionsOf(profile.data, account.data) : []), [profile.data, account.data]);
  return { sections, percent: completeness(sections), ready: !!profile.data && !account.isLoading, profile, account };
}
