import { View } from "react-native";
import { Button, Icon, Pill, Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useStudioText, type StudioStep } from "@/entities/admin-studio";
import { fmtDateTime } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";

const tone = (s: string) => (/approv|done|complete|pass/.test(s) ? "ok" : /reject|declin/.test(s) ? "err" : /change|return|rework/.test(s) ? "warn" : "wait");
const ICON = { ok: "check-circle", err: "x-circle", warn: "rotate-ccw", wait: "clock" } as const;

// Approval steps of the object: who decides, the decision, the reviewer's comment.
export function StepsPane({ steps, approvalFree, submitted, onReassign }: { steps: StudioStep[]; approvalFree: boolean; submitted: boolean; onReassign?: (s: StudioStep) => void }) {
  const { t, role, stepStatus, locale } = useStudioText();
  const c = useColors();
  const hue = { ok: c.ok, err: c.err, warn: c.warn, wait: c.gray };
  if (approvalFree) return <Text variant="small" tone="gray">{t("admStudioB.steps.free")}</Text>;
  if (!steps.length) return <Text variant="small" tone="gray">{t(submitted ? "admStudioB.steps.pending" : "admStudioB.steps.empty")}</Text>;
  return (
    <View style={{ gap: 10 }}>
      {steps.map((s, i) => {
        const k = tone(s.status);
        return (
          <RowCard
            key={s.id || i}
            title={s.title || role(s.role) || t("admStudioB.steps.step", { n: s.order || i + 1 })}
            subtitle={[t("admStudioB.steps.step", { n: s.order || i + 1 }), s.role ? role(s.role) : "", stepStatus(s.status)].filter(Boolean).join(" · ")}
            meta={[s.decidedBy, s.decidedAt ? fmtDateTime(s.decidedAt, locale) : ""].filter(Boolean).join(" · ")}
            right={<Icon name={ICON[k]} size={22} color={hue[k]} />}
          >
            {s.comment ? <Text variant="small" tone="gray">“{s.comment}”</Text> : null}
            {k === "wait" && (s.approvers.length || s.deadlineAt) ? (
              <View style={{ gap: 6 }}>
                {s.approvers.length ? <Text variant="caption" tone="gray">{t("admStudioD.approvals.approvers")}: {s.approvers.map((x) => x.name || x.id).join(", ")}</Text> : null}
                {s.deadlineAt ? <Pill small tone={s.overdue ? "err" : "gray"} icon={s.overdue ? "alert-circle" : "clock"} label={s.overdue ? t("admStudioD.approvals.overdueBadge") : `${t("admStudioD.approvals.deadline")}: ${fmtDateTime(s.deadlineAt, locale)}`} /> : null}
                {onReassign && s.approvers.length ? <Button title={t("admStudioD.approvals.reassign")} icon="user-plus" size="sm" variant="soft" onPress={() => onReassign(s)} style={{ alignSelf: "flex-start" }} /> : null}
              </View>
            ) : null}
          </RowCard>
        );
      })}
    </View>
  );
}
