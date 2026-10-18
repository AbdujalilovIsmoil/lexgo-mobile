import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Stars, type QualityComplaintRef, type RateTarget } from "@/entities/rating";
import { Button, Card, Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { target: RateTarget; sent?: { stars: number; complaint: QualityComplaintRef | null } | null };

// What is left once the form is gone: thanks, "you already rated this", or "the window is over".
export function RateOutcome({ target, sent }: Props) {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const w = target.window;
  const stars = sent?.stars ?? w.stars;
  const done = !!sent || w.submitted;
  const icon: IconName = done ? "check-circle" : "clock";
  const tint = done ? c.ok : c.gray;
  const complaint = sent?.complaint;
  return (
    <Card style={s.card}>
      <View style={[s.icon, { backgroundColor: done ? c.okBg : c.surface2 }]}><Icon name={icon} size={26} color={tint} /></View>
      <Text variant="h4" center>{done ? t("py10.done.title") : t("py10.closed.title")}</Text>
      <Text variant="small" tone="gray" center>{done ? t("py10.done.text") : t(`py10.closed.${w.closedReason === "not_ready" || w.closedReason === "deadline_missing" ? "notReady" : "expired"}`)}</Text>
      {stars ? <Stars value={stars} size={26} /> : null}
      {w.comment && !sent ? <Text variant="small" tone="gray" center>«{w.comment}»</Text> : null}
      {complaint ? <Text variant="small" tone="warn" center>{t("py10.done.complaint", { id: complaint.workId || "—" })}</Text> : null}
      <View style={s.row}>
        {complaint ? <Button title={t("py10.done.open")} variant="soft" size="sm" icon="message-square" onPress={() => router.replace("/complaints")} /> : null}
        <Button title={t("py10.done.back")} variant="line" size="sm" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { alignItems: "center", gap: 10, paddingVertical: 24 },
  icon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", gap: 10, marginTop: 6, flexWrap: "wrap", justifyContent: "center" },
});
