import { useRouter } from "expo-router";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Panel } from "./Panel";

// Advocates only: raise visibility (promotions) or upgrade the plan.
export function BoostCard({ i }: { i: number }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <Panel i={i} title={t("shm.dash.boostTitle")}>
      <Text variant="small" tone="gray">{t("shm.dash.boostSub")}</Text>
      <Button title={t("shm.dash.boostCta")} icon="zap" variant="gradient" full onPress={() => router.push("/pro/promotions" as never)} />
      <Button title={t("shm.dash.upgradeCta")} icon="arrow-right" iconRight variant="line" full onPress={() => router.push("/subscription" as never)} />
    </Panel>
  );
}
