import { Pill } from "@/shared/ui";
import { asNum } from "@/shared/lib/json";
import { CcTicket } from "@/shared/ui/cc";
import { StudioStatusPill, ctorMeta, statusTint, useStudioText, type StudioDetail } from "@/entities/admin-studio";
import { timeAgo } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { currentStepOf, submittedOf, versionLabel } from "./helpers";

type Props = { item: StudioDetail; mine: boolean; publishable: boolean; onPress: () => void; need?: string };

// One piece of work in the queue as a ticket: who sent it and when, the current step, "your turn" / "ready to publish".
export function ApprovalCard({ item, mine, publishable, onPress, need = "" }: Props) {
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
        {mine && need ? <Pill small tone={need === "returned" ? "warn" : publishable ? "ok" : "blue"} icon={need === "publish" ? "upload-cloud" : need === "returned" ? "rotate-ccw" : "user-check"} label={t(`admStudioD.appr.next.${need}`)} /> : sub.by ? <Pill small tone="gray" icon="user" label={t("admStudioD.appr.next.author", { name: sub.by })} /> : null}
        {sub.at ? <Pill small tone="gray" icon="clock" label={timeAgo(sub.at, t)} /> : null}
        {step && stepName ? <Pill small tone="gray" icon="layers" label={step.total > 1 ? t("admStudioC.card.step", { n: step.index + 1, total: step.total, name: stepName }) : stepName} /> : null}
        {asNum(item.raw.comments_count, 0) > 0 ? <Pill small tone="gray" icon="message-square" label={t("admStudioD.appr.comments", { n: asNum(item.raw.comments_count, 0) })} /> : null}
        {item.hasFile ? <Pill small tone="gray" icon="paperclip" label={t("admStudioC.card.file")} /> : null}
      </>}
      onPress={onPress}
    />
  );
}
