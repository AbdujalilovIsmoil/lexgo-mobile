import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, GradientBox, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { useIsAuthed } from "@/entities/session";
import type { ChatLimit } from "@/entities/chat";

// The server refused a question (guest daily / guest total / monthly quota): the copy is chosen by the
// error code and every number comes from the response body — nothing is hard-coded here.
export function LimitCard({ limit }: { limit: ChatLimit }) {
  const { t, locale } = useT();
  const router = useRouter();
  const authed = useIsAuthed();
  const g = limit.guest;
  const quota = limit.kind === "quota";
  const used = quota ? limit.used : g?.usedTotal;
  const cap = quota ? limit.monthlyLimit : g?.totalLimit;
  const title = quota ? t("ax1.quotaTitle") : t(limit.kind === "guest_daily" ? "ax1.dailyTitle" : "ax1.totalTitle");
  const n = g?.registeredFree ?? 0;
  const daily = limit.kind === "guest_daily";
  const body = quota ? t("ax1.quotaText") : t(`ax1.${daily ? "daily" : "total"}Text${n > 0 ? "" : "Plain"}`, { n });
  return (
    <GradientBox variant="dark" style={s.box}>
      <Text variant="h4" tone="white">{title}</Text>
      <Text variant="small" style={s.sub}>{body}</Text>
      {used && cap ? <Text variant="caption" style={s.sub}>{t("ax1.usedOf", { used, cap })}</Text> : null}
      {g?.resetsAt && limit.kind === "guest_daily" ? <Text variant="caption" style={s.sub}>{t("ax1.resetsAt", { when: fmtDateTime(g.resetsAt, locale) })}</Text> : null}
      <View style={s.row}>
        {authed || quota ? (
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
