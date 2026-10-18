import { useRouter } from "expo-router";
import { useAccess } from "@/entities/access";
import { useEntitlements } from "@/entities/plan";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { RowCard } from "@/shared/ui/admin";

// Subscription state, referral nudge and (for organization owners) the entry into /org.
export function InfoCards({ orgEntry }: { orgEntry?: React.ReactNode }) {
  const { t, locale } = useT();
  const router = useRouter();
  const { orgOwner } = useAccess();
  const plan = useEntitlements().data;
  return (
    <>
      {orgOwner ? orgEntry ?? <RowCard icon="briefcase" tint="#8B5CF6" title={t("aw1.org.title")} subtitle={t("aw1.org.text")} onPress={() => router.push("/org" as never)} /> : null}
      <RowCard icon="award" tint={plan?.active ? "#22C55E" : "#F59E0B"} title={t("aw1.sub.title")} subtitle={plan?.active ? t("aw1.sub.active", { date: fmtDate(plan.endsAt, locale) }) : t("aw1.sub.none")} onPress={() => router.push("/subscription" as never)} />
      <RowCard icon="gift" tint="#EC4899" title={t("aw1.ref.title")} subtitle={t("aw1.ref.text")} onPress={() => router.push("/pro/referrals" as never)} />
    </>
  );
}
