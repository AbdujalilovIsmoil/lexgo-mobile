import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";
import { ReferralPanel } from "@/widgets/pro-referrals";

// /pro/referrals — own referral code, QR, invitations and the commission ladder.
export default function ProReferralsPage() {
  const { t } = useT();
  return (
    <AdminPage title={t("aw10.title")} subtitle={t("aw10.sub")}>
      <ReferralPanel />
    </AdminPage>
  );
}
