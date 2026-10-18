import { StyleSheet, View } from "react-native";
import { Button, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { GATE_META } from "./gateMeta";
import { useGateActions } from "./useGateActions";
import type { AccountGate } from "@/entities/session";

type Props = { gate: Exclude<AccountGate, "ok">; seller: boolean; name: string; skey: string };

// Full-screen explanation of an account that cannot be used normally, always with a sign-out way out.
// Pending (waiting for an admin) is soft: sellers can finish their profile, others may continue.
export function GateCard({ gate, seller, name, skey }: Props) {
  const { t } = useT();
  const c = useColors();
  const a = useGateActions(skey);
  const meta = GATE_META[gate];
  const tint = meta.tone === "err" ? c.err : c.warn;
  return (
    <View style={s.col}>
      <View style={[s.icon, { backgroundColor: `${tint}22` }]}>
        <Icon name={meta.icon} size={38} color={tint} />
      </View>
      <Text variant="h2" center>{t(`au4.${gate}.title`)}</Text>
      {name ? <Text variant="small" tone="gray" center>{name}</Text> : null}
      <Text variant="body" tone="gray" center>{t(`au4.${gate}.text`)}</Text>
      <View style={s.actions}>
        {gate === "pending" && seller ? <Button title={t("au4.onboarding")} onPress={a.onboarding} variant="gradient" size="lg" full icon="edit-3" /> : null}
        {gate === "pending" ? <Button title={t("au4.proceed")} onPress={a.proceed} variant={seller ? "soft" : "gradient"} size="lg" full icon="arrow-right" /> : null}
        <Button title={t("au4.recheck")} onPress={() => void a.recheck()} loading={a.busy} variant="line" full icon="refresh-cw" />
        <Button title={t("profile.logout")} onPress={() => void a.signOut()} variant="ghost" full icon="log-out" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  col: { alignItems: "center", gap: 12, paddingHorizontal: 24 },
  icon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  actions: { alignSelf: "stretch", gap: 10, marginTop: 14 },
});
