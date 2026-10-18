import { Pill } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { StudioStatusPill, ctorMeta, statusTint, useStudioText, type StudioDetail } from "@/entities/admin-studio";
import { timeAgo } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { currentStepOf, submittedOf, versionLabel } from "./helpers";

type Props = { item: StudioDetail; mine: boolean; publishable: boolean; onPress: () => void };

// One piece of work in the queue as a ticket: who sent it and when, the current step, "your turn" / "ready to publish".
export function ApprovalCard({ item, mine, publishable, onPress }: Props) {
  const { t, ctorName, role } = useStudioText();
  const c = useColors();
  const sub = submittedOf(item);
  const step = currentStepOf(item);
  const ver = versionLabel(item);
  const stepName = step && (step.step.title || role(step.step.role));
  return (
    <CcTicket
      tint={publishable ? c.ok : mine ? c.accent : statusTint(c, item.status)}
      icon={ctorMeta(item.code).icon}
      title={item.title || t("admStudioC.untitled")}
      subtitle={`${ctorName(item.code)}${ver ? ` · v${ver}` : ""}`}
      badge={<StudioStatusPill status={item.status} raw={item.statusRaw} />}
      chips={<>
        {publishable ? <Pill label={t("admStudioC.card.ready")} tone="ok" icon="upload-cloud" small /> : mine ? <Pill label={t("admStudioC.card.yourTurn")} tone="blue" icon="user-check" small /> : null}
        {sub.by ? <Pill small tone="gray" icon="user" label={sub.by} /> : null}
        {sub.at ? <Pill small tone="gray" icon="clock" label={timeAgo(sub.at, t)} /> : null}
        {step && stepName ? <Pill small tone="gray" icon="layers" label={step.total > 1 ? t("admStudioC.card.step", { n: step.index + 1, total: step.total, name: stepName }) : stepName} /> : null}
        {item.hasFile ? <Pill small tone="gray" icon="paperclip" label={t("admStudioC.card.file")} /> : null}
      </>}
      onPress={onPress}
    />
  );
}
