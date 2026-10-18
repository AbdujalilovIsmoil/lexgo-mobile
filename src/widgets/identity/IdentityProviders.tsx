import { View } from "react-native";
import type { IdentityProvider } from "@/entities/identity";
import { Card, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { disabled: boolean; wait: number; note: { ok: boolean; msg: string } | null; onStart: (p: IdentityProvider) => void };
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// MyID (primary) and OneID entry buttons, the last result and the 429 countdown.
export function IdentityProviders({ disabled, wait, note, onStart }: Props) {
  const { t } = useT();
  const off = disabled || wait > 0;
  const prov = (p: IdentityProvider, name: string, sub: string, main?: boolean) => (
    <Card key={p} tinted={main} onPress={off ? undefined : () => onStart(p)} style={{ gap: 4, opacity: off ? 0.55 : 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text variant="h4">{name}</Text>
        {main ? <Pill label={t("cpr.idPrimary")} tone="cy" small /> : null}
      </View>
      <Text variant="small" tone="gray">{sub}</Text>
    </Card>
  );
  return (
    <View style={{ gap: 10 }}>
      {note ? <Text variant="small" tone={note.ok ? "ok" : "err"}>{note.msg}</Text> : null}
      {wait > 0 ? <Text variant="small" tone="gray">{t("cpr.idRetry", { time: clock(wait) })}</Text> : null}
      {prov("myid", "MyID", t("cpr.idMySub"), true)}
      {prov("oneid", "OneID", t("cpr.idOneSub"))}
      <Text variant="caption" tone="gray2">{t("cpr.idNoBio")}</Text>
    </View>
  );
}
