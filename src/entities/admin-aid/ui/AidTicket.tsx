import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { StatusPill } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { openTel } from "@/shared/lib/links";
import { useT } from "@/shared/i18n";
import { aidStatus } from "../model/labels";
import { aidTint } from "../model/stats";
import type { AidRequest } from "../model/types";

type Props = { item: AidRequest; onPress: () => void };

// One citizen request as a ticket: status colour strip, name + what happened, status, ID/date chips,
// a round call button (primary) and a round "details" button.
export function AidTicket({ item, onPress }: Props) {
  const { t, locale } = useT();
  const name = item.name || t("admAid.anon");
  return (
    <CcTicket
      tint={aidTint(item.status)} avatar={name} title={name} subtitle={item.details || item.phone || undefined}
      badge={<StatusPill status={item.status || "new"} label={aidStatus(t, item.status)} />}
      chips={<>{item.phone ? <Pill small tone="gray" icon="phone" label={item.phone} /> : null}{item.workId ? <Pill small tone="gray" label={item.workId} /> : null}<Pill small tone="gray" icon="calendar" label={fmtDate(item.createdAt, locale) || "—"} /></>}
      actions={<>{item.phone ? <CcAction primary icon="phone" label={`${t("adm.call")} ${item.phone}`} onPress={() => openTel(item.phone)} /> : null}<CcAction icon="eye" label={t("admAid.detailTitle")} onPress={onPress} /></>}
      onPress={onPress}
    />
  );
}
