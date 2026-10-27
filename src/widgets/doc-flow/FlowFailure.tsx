import { useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { GateNotice, planGateOf } from "@/entities/plan";
import { ApiError } from "@/shared/api";
import { Button, ErrorView, EmptyState } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { refusalCode } from "@/entities/doc-settings";
import { PlanGateSheet } from "@/features/plan-gate";
import { useT } from "@/shared/i18n";
import { FlowGate } from "./FlowGate";

type Props = { title: string; error: unknown; onRetry: () => void };

// Why a document flow cannot start: no template (404), the plan (402 — the backend's reason for its code, used / limit and the reset for a
// used-up limit, the way to the tariffs, and the plan sheet over it once to request a fitting tariff in place), the document service closed
// it for another reason (its code, TZ.md §4), or a plain error.
export function FlowFailure({ title, error, onRetry }: Props) {
  const { t } = useT();
  const router = useRouter();
  const [sheet, setSheet] = useState(true);
  const gate = useMemo(() => planGateOf(error), [error]);
  const status = error instanceof ApiError ? error.status : 0;
  const code = refusalCode(error);
  if (code && !gate) return <FlowGate title={title} gate={{ state: code === "document_mode_disabled" ? "off" : "locked", code, message: "" }} />;
  return (
    <AdminPage title={title}>
      {status === 404 ? (
        <EmptyState icon="file-minus" title={t("dc6.noTemplate")} text={t("dc6.noTemplateText")} actionLabel={t("common.back")} onAction={() => router.back()} />
      ) : gate ? (
        <View style={{ padding: 16, gap: 14 }}>
          <GateNotice gate={gate} titled />
          <Button title={t("dc6.seePlans")} icon="award" variant="gradient" full onPress={() => router.push("/subscription")} />
        </View>
      ) : (
        <ErrorView error={error} onRetry={onRetry} />
      )}
      <PlanGateSheet gate={gate && sheet ? gate : null} onClose={() => setSheet(false)} />
    </AdminPage>
  );
}
