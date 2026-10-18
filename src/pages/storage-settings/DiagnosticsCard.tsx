import { View } from "react-native";
import { clearBreadcrumbs, clearEvents, setAnalyticsEnabled, useAnalyticsStore } from "@/shared/analytics";
import { useT } from "@/shared/i18n";
import { Button, Text, toast } from "@/shared/ui";
import { SectionCard, SwitchField } from "@/shared/ui/admin";

// Anonymous usage statistics: screen names, timings in buckets, error classes — never phone numbers,
// names, message or document text, codes, tokens or file links. There is no sink yet, so the events
// only fill a buffer on this phone; the switch turns even that off.
export function DiagnosticsCard() {
  const { t } = useT();
  const { enabled, count } = useAnalyticsStore();
  return (
    <SectionCard title={t("nt3.diagTitle")}>
      <SwitchField label={t("nt3.diagSwitch")} hint={t("nt3.diagHint")} value={enabled} onChange={setAnalyticsEnabled} />
      <View style={{ gap: 10 }}>
        <Text variant="caption" tone="gray2">{t("nt3.diagCount", { n: count })}</Text>
        {count ? <Button title={t("nt3.diagClear")} variant="line" size="sm" onPress={() => { clearEvents(); clearBreadcrumbs(); toast(t("nt3.diagCleared"), "ok"); }} /> : null}
      </View>
    </SectionCard>
  );
}
