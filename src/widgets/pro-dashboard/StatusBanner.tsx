import { View } from "react-native";
import { useRouter } from "expo-router";
import { useCabinet, useOnboarding } from "@/entities/pro-workspace";
import { useT } from "@/shared/i18n";
import { Button, Card, Pill, Text } from "@/shared/ui";
import { ProgressBar, StatusPill } from "@/shared/ui/admin";

// Verification / onboarding state: shown only while the cabinet is limited or unverified.
export function StatusBanner() {
  const { t } = useT();
  const router = useRouter();
  const c = useCabinet().data;
  const ob = useOnboarding().data;
  if (!c || (!c.limited && c.verified)) return null;
  const blocked = (Object.keys(c.actions) as (keyof typeof c.actions)[]).filter((k) => !c.actions[k]);
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text variant="h4" style={{ flex: 1 }}>{t("aw1.ban.title")}</Text>
        <StatusPill status={c.verification || c.accountStatus || "pending"} />
      </View>
      <Text variant="small" tone="gray">{c.limitedReason || t("aw1.ban.text")}</Text>
      {ob && ob.total ? (
        <>
          <ProgressBar value={ob.done / ob.total} />
          <Text variant="caption" tone="gray">{t("aw1.ban.progress", { done: ob.done, total: ob.total })}</Text>
        </>
      ) : null}
      {blocked.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <Text variant="caption" tone="gray">{t("aw1.ban.blocked")}</Text>
          {blocked.map((k) => <Pill key={k} small tone="gray" icon="lock" label={t(`aw1.act.${k}`)} />)}
        </View>
      ) : null}
      <Button title={t("aw1.ban.cta")} icon="arrow-right" iconRight size="sm" onPress={() => router.push("/pro/onboarding" as never)} />
    </Card>
  );
}
