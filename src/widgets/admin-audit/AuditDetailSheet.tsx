import * as Clipboard from "expo-clipboard";
import { shortHash, humanAction, type AuditEntry, type ChainState } from "@/entities/admin-audit";
import { FactRows, FormSheet } from "@/shared/ui/admin";
import { Button, Pill, Text, toast } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

// One audit record in full, with the hash-chain indicator and what it means.
export function AuditDetailSheet({ item: current, state, onClose }: { item: AuditEntry | null; state?: ChainState; onClose: () => void }) {
  const { t, locale } = useT();
  const item = useKept(current);
  const copy = (v: string) => void Clipboard.setStringAsync(v).then(() => toast(t("adm.copied"), "ok"));
  return (
    <FormSheet visible={!!current} onClose={onClose} title={item ? humanAction(item.action) : ""} subtitle={item ? fmtDateTime(item.createdAt, locale) : undefined}>
      {item ? (
        <>
          <FactRows rows={[
            { label: t("admAudit.titleUz"), value: item.titleUz },
            { label: t("adm.details"), value: (locale === "uz" && item.descriptionUz) || item.detail },
            { label: t("admAudit.user"), value: item.userId },
            { label: t("admAudit.target"), value: [item.targetType, item.targetId].filter(Boolean).join(" · ") },
            { label: "IP", value: item.ip },
            { label: t("admAudit.outcomeLabel"), value: item.outcome },
            { label: t("admAudit.hash"), value: item.eventHash ? shortHash(item.eventHash) : "" },
            { label: t("admAudit.prevHash"), value: item.previousHash ? shortHash(item.previousHash) : "" },
          ]} />
          {state ? <Pill tone={state === "outside" ? "warn" : state === "none" ? "gray" : "ok"} label={t(`admAudit.chain.${state}`)} /> : null}
          {state ? <Text variant="small" tone="gray">{t(`admAudit.chainHint.${state}`)}</Text> : null}
          {item.eventHash ? <Button title={t("admAudit.copyHash")} icon="copy" variant="line" full onPress={() => copy(item.eventHash)} /> : null}
          {item.previousHash ? <Button title={t("admAudit.copyPrev")} icon="link" variant="line" full onPress={() => copy(item.previousHash)} /> : null}
        </>
      ) : null}
    </FormSheet>
  );
}
