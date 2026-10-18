import { CcAction } from "@/shared/ui/cc";
import { confirmDialog } from "@/shared/ui";
import { tapHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import type { Task } from "@/entities/admin-hrm";
import { useTaskStatus } from "../model/useWorkActions";

const START = ["new", "accepted", "returned", "paused"];
const FINISH = ["in_progress", "in_review"];

// Round quick action of a task row: start (gradient) while it waits, complete once it is running; asks first.
export function TaskQuick({ item }: { item: Task }) {
  const { t } = useT();
  const set = useTaskStatus();
  const start = START.includes(item.status);
  if (!start && !FINISH.includes(item.status)) return null;
  const next = start ? "in_progress" : "done";
  const go = () => {
    tapHaptic();
    confirmDialog({
      title: t(start ? "admHrmW.startQ" : "admHrmW.completeQ"), message: item.title, confirmLabel: t(start ? "admHrmW.start" : "admHrmW.complete"), cancelLabel: t("adm.cancel"), icon: start ? "play" : "check-circle",
      onConfirm: async () => { await set.mutateAsync({ id: item.id, status: next }); },
    });
  };
  return <CcAction icon={start ? "play" : "check"} label={t(start ? "admHrmW.start" : "admHrmW.complete")} primary={!start} loading={set.isPending} onPress={go} />;
}
