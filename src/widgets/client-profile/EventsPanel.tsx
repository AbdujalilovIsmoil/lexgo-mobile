import { View } from "react-native";
import { EventRow, useSecurityEvents } from "@/entities/security";
import { EmptyState, Text } from "@/shared/ui";
import { ProfileSection, RowsSkeleton, ShowMore, useShowMore } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

// Web "Xavfsizlik hodisalari" panel (security events, newest first, ten at a time) as a vertical timeline.
export function EventsPanel() {
  const { t } = useT();
  const q = useSecurityEvents();
  const rows = q.data ?? [];
  const page = useShowMore(rows);
  return (
    <ProfileSection accent="red" icon="shield" title={t("admSecC.kindEvents")} badge={q.data ? q.data.length : undefined}>
      <Text variant="small" tone="gray">{t("admSecC.evLead")}</Text>
      {q.isLoading ? <RowsSkeleton n={1} /> : !rows.length ? <EmptyState compact icon="shield" title={t("admSecC.evEmpty")} /> : (
        <View>{page.visible.map((e, i) => <EventRow key={e.id} item={e} last={i === page.visible.length - 1} />)}<ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} /></View>
      )}
    </ProfileSection>
  );
}
