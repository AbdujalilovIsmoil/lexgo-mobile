import { OtpRow, useTestOtps } from "@/entities/admin-otp";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { ApiError } from "@/shared/api";
import { EmptyState, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Staging-only list of the one-time codes the backend sent (phone, purpose, code); tap a row to copy.
export default function AdminOtpPage() {
  const { t } = useT();
  const q = useTestOtps();
  const notHere = q.isError && q.error instanceof ApiError && q.error.status === 404;
  return (
    <AdminPage title={t("admHub.mod.testOtps.title")} subtitle={q.data ? `${q.data.length}` : undefined}>
      {notHere ? (
        <EmptyState icon="shield" title={t("admOtp.stagingOnly")} text={t("admOtp.stagingOnlyText")} />
      ) : (
        <PagedList
          data={q.data ?? []}
          query={q}
          keyExtractor={(o) => o.id}
          renderItem={(o) => <OtpRow item={o} />}
          empty={{ icon: "key", title: t("admOtp.empty"), text: t("admOtp.lead") }}
          header={<Text variant="small" tone="gray" style={{ paddingBottom: 12 }}>{t("admOtp.lead")} {t("admOtp.tapHint")}</Text>}
        />
      )}
    </AdminPage>
  );
}
