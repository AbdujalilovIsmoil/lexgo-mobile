import type { Running } from "@/entities/promotion";
import { Pill } from "@/shared/ui";
import { RowCard, SectionCard } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

const ICON = { banner: "image", profile_boost: "user-check", service_boost: "briefcase" } as const;

// Promotions that run now: where, for which service, how long is left, and whether clients really see them
// (`liveIds` = ids that GET /promotions/active serves to the marketplace).
export function RunningList({ items, liveIds }: { items: Running[]; liveIds: Set<string> }) {
  const { t, locale } = useT();
  return (
    <SectionCard title={t("sl10.running")}>
      {!items.length ? <RowCard icon="radio" tint="#8A99AC" title={t("sl10.noneTitle")} subtitle={t("sl10.noneText")} /> : null}
      {items.map((r) => (
        <RowCard
          key={r.id || `${r.placement}-${r.serviceId}`}
          icon={ICON[r.placement]}
          tint="#06B6D4"
          title={r.serviceTitle || t(`sl11.placement.${r.placement}`)}
          subtitle={[t(`sl11.placement.${r.placement}`), r.packageTitle].filter(Boolean).join(" · ")}
          meta={r.endsAt ? t("sl10.until", { date: fmtDate(r.endsAt, locale) }) : undefined}
          right={<Pill label={t("sl10.daysLeft", { n: r.daysLeft })} tone="cy" small />}
        >
          {liveIds.has(r.id) ? <Pill label={t("sl10.live")} tone="ok" icon="eye" small /> : null}
        </RowCard>
      ))}
    </SectionCard>
  );
}
