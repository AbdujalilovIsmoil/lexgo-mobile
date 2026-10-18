import { useMemo } from "react";
import { View } from "react-native";
import { SessionRow, useDeviceSessions } from "@/entities/security";
import { useSession } from "@/entities/session";
import { useIdentifyDevice, useRevokeSession } from "@/features/security";
import { EmptyState } from "@/shared/ui";
import { ProfileSection, RowsSkeleton, ShowMore, useShowMore } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

// Web "Aktiv sessiyalar" panel (GET /auth/sessions): this device first; revoking it signs the app out.
export function SessionsPanel() {
  const { t } = useT();
  const q = useDeviceSessions();
  const sid = useSession()?.sid;
  const revoke = useRevokeSession();
  useIdentifyDevice(!!sid);
  const rows = useMemo(() => {
    const all = (q.data ?? []).map((s) => ({ ...s, current: s.current ?? (sid ? s.id === sid : undefined) }));
    return [...all.filter((s) => s.current), ...all.filter((s) => !s.current)];
  }, [q.data, sid]);
  const page = useShowMore(rows);
  return (
    <ProfileSection accent="teal" icon="smartphone" title={t("cpr.sessions")} badge={q.data ? rows.length : undefined}>
      {q.isLoading ? <RowsSkeleton /> : !rows.length ? <EmptyState compact icon="smartphone" title={t("admSecB.sessEmpty")} /> : (
        <View style={{ gap: 10 }}>{page.visible.map((s) => <SessionRow key={s.id} item={s} onRevoke={revoke} />)}<ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} /></View>
      )}
    </ProfileSection>
  );
}
