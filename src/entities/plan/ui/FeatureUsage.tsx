import { StyleSheet } from "react-native";
import { Button, Card } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { gateOfFeature } from "../lib/planGate";
import { useFeature } from "../model/queries";
import { useFeatureLabel } from "../model/useFeatureLabel";
import { FeatureRow } from "./FeatureRow";

// TZ.md §13.1 where a feature is used: a limited one shows used / limit, what is left and when it resets; a locked or used-up one adds the
// way to a plan. Nothing for an unlimited feature or one the backend does not list (the action's own 402 still decides).
export function FeatureUsage({ featureKey, onUpgrade }: { featureKey: string; onUpgrade: () => void }) {
  const { t } = useT();
  const f = useFeature(featureKey);
  const label = useFeatureLabel();
  if (!f || f.mode === "unlimited") return null;
  const stopped = !!gateOfFeature(f, featureKey);
  return (
    <Card style={s.card}>
      <FeatureRow f={f} label={label(featureKey)} first />
      {stopped ? <Button title={t("mf.plan.upgrade")} icon="arrow-up-circle" variant="soft" size="sm" onPress={onUpgrade} style={s.center} /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  center: { alignSelf: "center" },
});
