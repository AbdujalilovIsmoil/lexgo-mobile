import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Icon, Pill, Text } from "@/shared/ui";
import { mmss } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { rateHref, useCountdown, type UrgentRequest } from "@/entities/urgent";

// The 15-minute window after completion. Whether it is open is the backend's flag; the clock only draws the countdown.
// The rating itself (stars, comment, the complaint a 1-2 star rating opens) is the shared /rate/[workId] screen.
export function RateCard({ req }: { req: UrgentRequest }) {
  const { t } = useT();
  const router = useRouter();
  const left = useCountdown(req.rating.deadlineAt);
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Text variant="h4" style={{ flex: 1 }}>{t("ug3.rateTitle")}</Text>
        {left > 0 ? <Pill small tone="warn" icon="clock" label={t("ug3.left", { time: mmss(left) })} /> : null}
      </View>
      <Text variant="small" tone="gray">{t("ug3.rateLead")}</Text>
      <Button title={t("ug3.rateCta")} variant="gradient" icon="star" full onPress={() => router.push(rateHref(req.workId))} />
    </Card>
  );
}

// After the window: the rating given, or the sentence that it is shut. Nothing for a record that never opened one.
export function RateResult({ req }: { req: UrgentRequest }) {
  const { t } = useT();
  if (req.rating.submitted) return <Note icon="star" title={t("ug3.thanks")} text={req.rating.value ? t("ug3.given", { n: req.rating.value }) : undefined} />;
  if (req.status === "completed" && req.rating.closedReason === "expired") return <Note icon="clock" title={t("ug3.closedTitle")} text={t("ug3.closedText")} />;
  return null;
}

function Note({ icon, title, text }: { icon: "star" | "clock"; title: string; text?: string }) {
  return (
    <Card tinted style={{ flexDirection: "row", gap: 12 }}>
      <Icon name={icon} size={22} tone="accent" />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" weight="bold">{title}</Text>
        {text ? <Text variant="small" tone="gray">{text}</Text> : null}
      </View>
    </Card>
  );
}
