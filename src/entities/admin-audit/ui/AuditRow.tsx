import { memo } from "react";
import * as Clipboard from "expo-clipboard";
import { Pill, toast } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { useColors } from "@/shared/theme";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { shortHash } from "../model/chain";
import { outcomeKind } from "../model/outcome";
import type { AuditEntry, ChainState } from "../model/types";

export const humanAction = (a: string) => (a ? a.replace(/[._-]+/g, " ").replace(/^./, (c) => c.toUpperCase()) : "—");
const CHAIN_TONE = { linked: "ok", linkedFar: "ok", outside: "warn", genesis: "blue", none: "gray" } as const;
type Props = { item: AuditEntry; state?: ChainState; hashed: boolean; onOpen: (e: AuditEntry) => void };

// One audit record as a ticket: strip by outcome, action + time, who / target / IP chips, hash-chain pill, copy-hash and open buttons.
export const AuditRow = memo(function AuditRow({ item, state, hashed, onOpen }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const kind = outcomeKind(item);
  const uz = locale === "uz";
  const key = `admAudit.outcome.${item.outcome}`;
  const copy = () => void Clipboard.setStringAsync(item.eventHash).then(() => toast(t("adm.copied"), "ok"));
  return (
    <CcTicket
      tint={kind === "bad" ? c.err : kind === "other" ? c.warn : c.accent} icon={kind === "ok" ? "activity" : "alert-triangle"}
      title={`${humanAction(item.action)}${uz && item.titleUz ? ` · ${item.titleUz}` : ""}`} onPress={() => onOpen(item)}
      subtitle={[fmtDateTime(item.createdAt, locale), (uz && item.descriptionUz) || item.detail].filter(Boolean).join(" · ")}
      badge={item.eventHash ? <Pill small tone="gray" label={`#${shortHash(item.eventHash).slice(0, 6)}`} /> : undefined}
      chips={<>
        {kind !== "ok" ? <Pill small tone={kind === "bad" ? "err" : "gray"} label={t(key) !== key ? t(key) : item.outcome} /> : null}
        {hashed && state ? <Pill small tone={CHAIN_TONE[state]} icon={state === "outside" ? "help-circle" : "link"} label={t(`admAudit.chain.${state}`)} /> : null}
        {item.userId ? <Pill small tone="blue" icon="user" label={`${item.userId.slice(0, 8)}…`} /> : null}
        {item.targetType || item.targetId ? <Pill small tone="cy" icon="layers" label={[item.targetType, item.targetId.slice(0, 8)].filter(Boolean).join(" · ")} /> : null}
        {item.ip ? <Pill small tone="gray" label={item.ip} /> : null}
      </>}
      actions={<>{item.eventHash ? <CcAction icon="copy" label={t("admAudit.copyHash")} onPress={copy} /> : null}<CcAction primary icon="chevron-right" label={t("admRolesB.open")} onPress={() => onOpen(item)} /></>}
    />
  );
});
