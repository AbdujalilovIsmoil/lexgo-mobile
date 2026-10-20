import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { AnalysisResult } from "@/entities/doc-analysis";
import { useIsAuthed } from "@/entities/session";
import { AnalysisInput, HandoffCard, UpsellCard, useDocAnalysis, useHandoff } from "@/features/doc-analysis";
import { Button, Header, Screen, Text } from "@/shared/ui";
import { ManualDocPlanSheet } from "@/features/manual-doc-plan";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// AI document analysis (TZ 16): file or text → result → optional advocate review.
// The server measures the pages; a fee past the base allowance waits for Telegram approval.
export function DocAnalysisPage() {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const authed = useIsAuthed();
  const d = useDocAnalysis();
  const h = useHandoff(d.file, d.result);
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <Header title={t("docs.title")} />
      <Screen topInset={false} contentContainerStyle={s.content}>
        <Text variant="small" tone="gray">{t("docs.sub")}</Text>
        {!authed ? (
          <>
            <Text variant="body" tone="warn">{t("docs.needLogin")}</Text>
            <Button title={t("auth.submit")} onPress={() => router.push("/auth/login")} variant="gradient" icon="log-in" full />
          </>
        ) : d.status === "done" && d.result ? (
          <>
            <AnalysisResult result={d.result} />
            <UpsellCard result={d.result} d={d} />
            {h.available ? <HandoffCard h={h} /> : null}
            <Button title={t("docs.again")} onPress={d.reset} variant="line" icon="refresh-cw" full />
          </>
        ) : (
          <AnalysisInput d={d} />
        )}
      </Screen>
      <ManualDocPlanSheet message={d.plan ?? h.plan} onClose={() => (d.plan !== null ? d.closePlan() : h.closePlan())} />
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 }, content: { gap: 14, paddingTop: 4 } });
