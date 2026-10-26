import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { deadlineLabel, useBusinessHours } from "@/entities/business-hours";
import { orderDeadline, useReplacement, type CaseItem } from "@/entities/client-case";
import { humanizeSlug } from "@/shared/lib/format";

// The seller's answer deadline (working hours only) and the latest replacement request of a case.
export function CaseMeta({ item }: { item: CaseItem }) {
  const c = useColors();
  const { t } = useT();
  const hours = useBusinessHours();
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const t0 = setTimeout(tick, 0);
    const iv = setInterval(tick, 60000);
    return () => { clearTimeout(t0); clearInterval(iv); };
  }, []);
  const repl = useReplacement(item.case?.id ?? "");
  const dl = orderDeadline(item.order, hours, now);
  const last = repl.data?.[repl.data.length - 1];
  const st = (last?.status ?? "").toLowerCase();
  const label = t(`ccs.replacementStates.${st}`) !== `ccs.replacementStates.${st}` ? t(`ccs.replacementStates.${st}`) : humanizeSlug(st);
  const text = dl ? (dl.overdue ? t("ccs.deadlineOverdue") : t("ccs.deadlineText", { when: deadlineLabel(dl.at, now, { today: t("ccs.deadlineToday"), tomorrow: t("ccs.deadlineTomorrow") }) })) : "";
  return (
    <View style={s.wrap}>
      {text ? <View style={s.row}><Icon name="clock" size={13} color={dl?.overdue ? c.err : c.gray} /><Text variant="caption" tone={dl?.overdue ? "err" : "gray"} style={s.flex}>{text}</Text></View> : null}
      {item.case?.nextAction ? <View style={s.row}><Icon name="arrow-right" size={13} tone="accent" /><Text variant="caption" tone="accent" style={s.flex}>{item.case.nextAction}</Text></View> : null}
      {last ? <Text variant="caption" tone="gray">{t("ccs.replacementStatus", { status: label })}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flex: 1 },
});
