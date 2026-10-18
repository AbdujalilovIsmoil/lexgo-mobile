import type { Placement } from "@/entities/promotion";
import { PLACEMENTS } from "@/entities/promotion";
import { RowCard, SectionCard } from "@/shared/ui/admin";
import { Icon } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const ICON = { banner: "image", profile_boost: "user-check", service_boost: "briefcase" } as const;

// Step 1 — where the promotion appears: banner · profile boost in the list · single-service boost (TZ 20).
export function PlacementStep({ value, onChange }: { value: Placement | null; onChange: (p: Placement) => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <SectionCard title={t("sl11.step.placement")}>
      {PLACEMENTS.map((p) => (
        <RowCard key={p} icon={ICON[p]} title={t(`sl11.placement.${p}`)} subtitle={t(`sl11.placementHint.${p}`)} onPress={() => onChange(p)} right={<Icon name={value === p ? "check-circle" : "circle"} size={22} color={value === p ? c.accent : c.gray2} />} />
      ))}
    </SectionCard>
  );
}
