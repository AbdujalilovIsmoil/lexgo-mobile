import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, GradientBox, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDate, fmtDateTime } from "@/shared/lib/format";
import { useGateText, type PlanGate } from "@/entities/plan";
import { useIsAuthed } from "@/entities/session";
import type { ChatLimit } from "@/entities/chat";

// A 402: the backend's code picks the words (used-up AI limit, no active subscription, not in the plan), its numbers the counter.
function PlanLimit({ gate }: { gate: PlanGate }) {
  const { t, locale } = useT();
  const router = useRouter();
  const { title, text } = useGateText(gate);
  const counted = gate.used !== null && gate.limit !== null && gate.limit > 0;
  return (
    <GradientBox variant="dark" style={s.box}>
      <Text variant="h4" tone="white">{title}</Text>
      <Text variant="small" style={s.sub}>{text}</Text>
      {counted ? <Text variant="caption" style={s.sub}>{t("ax1.usedOf", { used: gate.used ?? 0, cap: gate.limit ?? 0 })}</Text> : null}
      {gate.resetsAt ? <Text variant="caption" style={s.sub}>{t("mf.plan.resets", { date: fmtDate(gate.resetsAt, locale) })}</Text> : null}
      <View style={s.row}>
        <Button title={t("ai.upgradePlan")} onPress={() => router.push("/subscription")} variant="glass" size="sm" icon="credit-card" />
      </View>
    </GradientBox>
  );
}

// The server refused a question (guest daily / guest total / the plan's 402): the copy is chosen by the error code and every number comes
// from the response body — nothing is hard-coded here.
export function LimitCard({ limit }: { limit: ChatLimit }) {
  const { t, locale } = useT();
  const router = useRouter();
  const authed = useIsAuthed();
  if (limit.gate) return <PlanLimit gate={limit.gate} />;
  const g = limit.guest;
  const title = t(limit.kind === "guest_daily" ? "ax1.dailyTitle" : "ax1.totalTitle");
  const n = g?.registeredFree ?? 0;
  const daily = limit.kind === "guest_daily";
  const body = t(`ax1.${daily ? "daily" : "total"}Text${n > 0 ? "" : "Plain"}`, { n });
  return (
    <GradientBox variant="dark" style={s.box}>
      <Text variant="h4" tone="white">{title}</Text>
      <Text variant="small" style={s.sub}>{body}</Text>
      {g?.usedTotal && g.totalLimit ? <Text variant="caption" style={s.sub}>{t("ax1.usedOf", { used: g.usedTotal, cap: g.totalLimit })}</Text> : null}
      {g?.resetsAt && daily ? <Text variant="caption" style={s.sub}>{t("ax1.resetsAt", { when: fmtDateTime(g.resetsAt, locale) })}</Text> : null}
      <View style={s.row}>
        {authed ? (
          <Button title={t("ai.upgradePlan")} onPress={() => router.push("/subscription")} variant="glass" size="sm" icon="credit-card" />
        ) : (
          <>
            <Button title={t("auth.createAccount")} onPress={() => router.push("/auth/register")} variant="gradient" size="sm" icon="user-plus" />
            <Button title={t("ai.login")} onPress={() => router.push("/auth/login")} variant="glass" size="sm" />
          </>
        )}
      </View>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  box: { padding: 18, gap: 8, marginVertical: 8 },
  sub: { color: "#C4DEFF" },
  row: { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" },
});
