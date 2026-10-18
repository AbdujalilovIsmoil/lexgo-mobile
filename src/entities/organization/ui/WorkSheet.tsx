import { FormSheet } from "@/shared/ui/admin";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import type { WorkItem } from "../model/workTypes";
import { WorkFacts } from "./WorkFacts";

type Props = { item: WorkItem | null; memberName?: string; onClose: () => void };

// One order / case / urgent request in a drawer.
export function WorkSheet({ item: current, memberName, onClose }: Props) {
  const { t } = useT();
  const w = useKept(current);
  return (
    <FormSheet visible={!!current} onClose={onClose} title={w?.title || t("og4.untitled")} subtitle={w?.workId} snaps={[0.62, 0.92]}>
      {w ? <WorkFacts item={w} memberName={memberName} /> : null}
    </FormSheet>
  );
}
