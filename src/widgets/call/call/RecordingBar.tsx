import { StyleSheet, View } from "react-native";
import { Button, Icon, Text } from "@/shared/ui";
import type { ReactNode } from "react";
import type { Recording } from "@/features/call";
import { useT } from "@/shared/i18n";

// Recording consent strip under the header: the host sees the client's request with Allow / Deny, the client sees
// where the request stands, everybody sees that a recording is running. Nothing records before the host says yes.
export function RecordingBar({ rec }: { rec: Recording }) {
  const { t } = useT();
  const who = rec.who || t("admMeet.someone");
  if (rec.state === "recording") return <Bar icon="radio" tone="#B42318" text={t("ms6.recOn", { name: who })} />;
  if (rec.state === "requested" && rec.host) {
    return (
      <Bar icon="circle" tone="#1D4ED8" text={t("ms6.recAsk", { name: who })}>
        <Button title={t("ms6.allow")} size="sm" variant="glass" onPress={() => rec.answer.mutate(true)} loading={rec.answer.isPending} />
        <Button title={t("ms6.deny")} size="sm" variant="ghost" onPress={() => rec.answer.mutate(false)} disabled={rec.answer.isPending} />
      </Bar>
    );
  }
  if (rec.state === "requested" && rec.byMe) return <Bar icon="clock" tone="#475569" text={t("ms6.recWaiting")} />;
  if (rec.state === "allowed" && (rec.byMe || rec.host)) return <Bar icon="check-circle" tone="#15803D" text={t("ms6.recAllowed")}><Button title={t("ms6.start")} size="sm" variant="glass" onPress={() => rec.start.mutate()} loading={rec.start.isPending} /></Bar>;
  if (rec.state === "denied" && rec.byMe) return <Bar icon="slash" tone="#B45309" text={t("ms6.recDenied")} />;
  return null;
}

function Bar({ icon, tone, text, children }: { icon: "radio" | "circle" | "clock" | "check-circle" | "slash"; tone: string; text: string; children?: ReactNode }) {
  return (
    <View style={[s.bar, { backgroundColor: tone }]}>
      <Icon name={icon} size={16} color="#FFFFFF" />
      <Text variant="small" weight="semibold" tone="white" style={s.text}>{text}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingVertical: 7, paddingHorizontal: 12, marginHorizontal: 12, marginTop: 6 },
  text: { flex: 1 },
});
