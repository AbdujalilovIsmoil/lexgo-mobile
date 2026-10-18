import { View } from "react-native";
import { FactTiles } from "@/widgets/client-profile";
import { Reveal } from "@/shared/ui";
import { fmtRating } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import type { Lawyer } from "@/entities/lawyer";

// The web hero's six numbers, as the profile's tile grid: rating · ratings · years · cases · success · orders done.
export function SpecialistStats({ lawyer: l }: { lawyer: Lawyer }) {
  const { t, locale } = useT();
  const success = l.totalCases > 0;
  return (
    <Reveal i={1}>
      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <FactTiles unset="—" facts={[
          { icon: "star", label: t("mkd.stats.rating"), value: l.rated ? fmtRating(l.rating, locale).replace(".", ",") : undefined },
          { icon: "message-square", label: t("mkd.stats.reviews"), value: String(l.reviews) },
          { icon: "briefcase", label: t("mkd.stats.experience"), value: String(l.experienceYears) },
          { icon: "folder", label: t("mkd.stats.cases"), value: l.totalCases ? String(l.totalCases) : undefined },
          { icon: "trending-up", label: t("mkd.stats.success"), value: success ? `${Math.round(l.successRate)}%` : undefined },
          { icon: "check-circle", label: t("mkd.stats.completed"), value: String(l.completed) },
        ]} />
      </View>
    </Reveal>
  );
}
