import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { Button, Card, Pill, PressableScale, Text } from "@/shared/ui";
import { isFuture } from "../lib/normalize";
import type { ServiceRule } from "../model/types";

type Props = { rule: ServiceRule; busy: boolean; locked: boolean; onAccept: (r: ServiceRule) => void };

// One rule: scope pill, version, effective date, state, collapsible text and the accept button.
export function RuleCard({ rule, busy, locked, onAccept }: Props) {
  const c = useColors();
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  const future = isFuture(rule.effectiveAt);
  const date = fmtDate(rule.effectiveAt, locale);
  return (
    <Card style={s.card}>
      <View style={s.pills}>
        {rule.scope ? <Pill label={t(`svcRules.rulesScope${rule.scope[0].toUpperCase()}${rule.scope.slice(1)}`)} tone="cy" small /> : null}
        {rule.accepted ? <Pill label={rule.acceptedAt ? t("svcRules.rulesStateAcceptedAt", { date: fmtDate(rule.acceptedAt, locale) }) : t("svcRules.rulesStateAccepted")} tone="ok" icon="check" small /> : <Pill label={t("svcRules.rulesStateNew")} tone="warn" small />}
      </View>
      <Text variant="h4">{rule.title}</Text>
      <Text variant="caption" tone="gray">
        {[rule.version ? t("svcRules.rulesVersion", { version: rule.version }) : "", date ? t(future ? "svcRules.rulesEffectiveFrom" : "svcRules.rulesEffectiveSince", { date }) : ""].filter(Boolean).join(" · ")}
      </Text>
      {!rule.accepted ? <Text variant="caption" tone="warn">{t("svcRules.rulesBlocking")}</Text> : null}
      <PressableScale onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={t(open ? "svcRules.rulesHideText" : "svcRules.rulesShowText")} style={s.toggle}>
        <Text variant="small" tone="accent" weight="semibold">{t(open ? "svcRules.rulesHideText" : "svcRules.rulesShowText")}</Text>
      </PressableScale>
      {open ? (
        <View style={[s.body, { backgroundColor: c.surface2 }]}>
          <Text variant="small" tone={rule.body ? "ink" : "gray"} selectable>{rule.body || t("svcRules.rulesNoBody")}</Text>
        </View>
      ) : null}
      {!rule.accepted ? <Button title={t(busy ? "svcRules.rulesAccepting" : "svcRules.rulesAccept")} loading={busy} disabled={busy || locked} onPress={() => onAccept(rule)} full /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 8 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  toggle: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  body: { padding: 12, borderRadius: radius.r },
});
