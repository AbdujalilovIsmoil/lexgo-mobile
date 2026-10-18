import { useMemo } from "react";
import { SessionRow, useDeviceSessions, useLocalPaged } from "@/entities/security";
import { useSession } from "@/entities/session";
import { useIdentifyDevice, useRevokeSession } from "@/features/security";
import { Text } from "@/shared/ui";
import { PagedList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// "Sessions" tab: every signed-in device (shown 20 at a time), each with a sign-out button. This
// device is found once (see identifyDevice) and listed first; signing it out signs the app out.
export function SessionsTab() {
  const { t } = useT();
  const q = useDeviceSessions();
  const sid = useSession()?.sid;
  const revoke = useRevokeSession();
  useIdentifyDevice(!!sid);
  const rows = useMemo(() => {
    const all = (q.data ?? []).map((s) => ({ ...s, current: s.current ?? (sid ? s.id === sid : undefined) }));
    return [...all.filter((s) => s.current), ...all.filter((s) => !s.current)];
  }, [q.data, sid]);
  const { items, total, query } = useLocalPaged(rows, q);
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(s) => s.id}
      renderItem={(s) => <SessionRow item={s} onRevoke={revoke} />}
      empty={{ icon: "smartphone", title: t("admSecB.sessEmpty"), text: t("admSecB.sessEmptyText") }}
      header={q.data ? <Text variant="small" tone="gray" style={{ marginBottom: 12 }}>{`${t("admSecB.sessLead")} ${t("admSecB.sessCount", { n: total })}`}</Text> : null}
    />
  );
}
