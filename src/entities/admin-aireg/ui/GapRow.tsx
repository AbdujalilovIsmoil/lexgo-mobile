import { Pill, Text } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { fmtDateTime } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { isOpenGap } from "../api/normGap";
import type { Gap } from "../model/types";
import { useRegLabels } from "./labels";

// A question the AI could not answer as a ticket: how often it was asked (badge), by whom and when, what was missing,
// and a round button that writes the answer into a reglament.
export function GapRow({ item, done, canAdd, onAdd }: { item: Gap; done: boolean; canAdd: boolean; onAdd: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const l = useRegLabels();
  const open = isOpenGap(item);
  const why = [item.reason, ...item.missing].filter(Boolean).join("; ");
  const who = [item.role ? l.role(item.role) : "", item.userName].filter(Boolean).join(" · ");
  return (
    <CcTicket
      tint={done || !open ? c.ok : c.warn} icon={done || !open ? "check-circle" : "help-circle"} title={item.question} titleLines={3}
      subtitle={[who, item.lastAskedAt ? t("admAiReg.last", { date: fmtDateTime(item.lastAskedAt, locale) }) : ""].filter(Boolean).join(" · ") || undefined}
      badge={done ? <Pill small tone="ok" label={t("admAiReg.added")} /> : !open ? <Pill small tone="gray" label={l.gapStatus(item.status)} /> : <Pill small tone="warn" icon="flag" label={`×${item.count}`} />}
      chips={why ? <Text variant="caption" tone="gray"><Text variant="caption" weight="bold" tone="gray">{t("admAiReg.why")} </Text>{why}</Text> : undefined}
      actions={canAdd ? <CcAction primary={!done} icon="plus" label={done ? t("admAiReg.addMore") : t("admAiReg.add")} onPress={onAdd} /> : undefined}
    />
  );
}
