import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { fmtDate } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { Reglament } from "../model/types";
import { useRegLabels } from "./labels";

const TONE = { active: "ok", draft: "warn", archived: "gray" } as const;
type Props = { item: Reglament; onPress: () => void; onEdit?: () => void; busy?: boolean };

// One reglament as a ticket: status strip and badge, category / version / file / date chips, round buttons (read, new version).
export function ReglamentRow({ item, onPress, onEdit, busy }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const l = useRegLabels();
  const fromFile = Boolean(item.fileName) || item.source === "upload" || item.source === "file";
  const tint = { active: c.ok, draft: c.warn, archived: c.gray2 }[item.status];
  return (
    <CcTicket
      tint={tint} icon={fromFile ? "paperclip" : "file-text"} title={item.title} subtitle={l.cat(item.category)} onPress={onPress}
      badge={<Pill small tone={TONE[item.status]} label={l.status(item.status, item.statusRaw)} />}
      chips={<>
        {item.version ? <Pill small tone="blue" label={`v${item.version}`} /> : null}
        {item.versions.length > 1 ? <Pill small tone="gray" icon="clock" label={t("admAiReg.versions", { n: item.versions.length })} /> : null}
        {item.updatedAt ? <Pill small tone="gray" label={fmtDate(item.updatedAt, locale)} /> : null}
      </>}
      actions={<>
        <CcAction icon="eye" label={t("admAiRegD.seeText")} onPress={onPress} />
        {onEdit && item.id ? <CcAction primary icon="edit-2" label={t("admAiReg.newVersion")} onPress={onEdit} loading={busy} /> : null}
      </>}
    />
  );
}
