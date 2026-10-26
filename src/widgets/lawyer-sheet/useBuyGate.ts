import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import type { Lawyer } from "@/entities/lawyer";
import { useT } from "@/shared/i18n";

// Why this client cannot buy from this specialist right now ("" = can). The
// backend enforces the same rules; this only explains them before the request.
export function useBuyGate(lawyer: Lawyer): string {
  const { t } = useT();
  const user = useSession()?.user;
  const a = useAccess();
  if (!user) return "";
  if (user.id === lawyer.userId) return t("mk2.blockedOwn");
  if (a.seller) return t("mk2.blockedSeller");
  if (!lawyer.verified) return t("mk2.blockedUnverified");
  if (!lawyer.available) return t("mk2.blockedBusy");
  return "";
}
