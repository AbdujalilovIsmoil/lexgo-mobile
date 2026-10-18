import { View } from "react-native";
import { FOUR_STEPS, fourStepsDone, stepState, type RegDetail, type StepState } from "@/entities/admin-reg";
import { SectionCard } from "@/shared/ui/admin";
import { Icon, Pill, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const ICON: Record<StepState, IconName> = { done: "check-circle", pending: "clock", rejected: "x-circle" };

// The LexGo four-step verification (phone, identity, practice, rules) and whether the seller may be accepted.
export function FourStepCard({ d }: { d: RegDetail }) {
  const { t } = useT();
  const c = useColors();
  const tone: Record<StepState, string> = { done: c.ok, pending: c.warn, rejected: c.err };
  return (
    <SectionCard title={t("admRegB.fourTitle")}>
      <Text variant="small" tone="gray">{t("admRegB.fourLead")}</Text>
      {FOUR_STEPS.map((step, i) => {
        const st = stepState(d, step);
        return (
          <View key={step} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Icon name={ICON[st]} size={22} color={tone[st]} />
            <View style={{ flex: 1 }}>
              <Text variant="small" weight="bold">{t(`admRegB.step.${step}`)}</Text>
              <Text variant="caption" tone="gray">{t(`admRegB.stepState.${st}`)}</Text>
            </View>
            <Text variant="caption" tone="gray2">{i + 1}/4</Text>
          </View>
        );
      })}
      {fourStepsDone(d) ? <Pill label={t("admRegB.fourDone")} tone="ok" icon="shield" /> : null}
    </SectionCard>
  );
}
