import { memo } from "react";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { statusColor } from "../lib/tone";
import { Enter } from "./Enter";
import { HrmStatus } from "./HrmStatus";
import type { Position } from "../model/types";

// One job position as a ticket: status strip, title, description, code / category / grade chips and an edit button.
export const PositionRow = memo(function PositionRow({ item, onPress, index }: { item: Position; onPress: () => void; index?: number }) {
  const { t } = useT();
  return (
    <Enter index={index}>
      <CcTicket
        tint={statusColor(item.status)} icon="briefcase" title={item.title} subtitle={item.description || undefined} badge={<HrmStatus status={item.status} />} onPress={onPress}
        chips={[item.code, item.category, item.grade].filter(Boolean).map((x) => <Pill key={x} small tone="gray" label={x} />)}
        actions={<CcAction primary icon="edit-2" label={t("admHrmU.editPos")} onPress={onPress} />}
      />
    </Enter>
  );
});
