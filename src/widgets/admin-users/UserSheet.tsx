import { useAccess } from "@/entities/access";
import { useUserDetail, type UserDetail, type UserHit } from "@/entities/admin-users";
import { FactRows, FormSheet, QueryBoundary, StatusPill } from "@/shared/ui/admin";
import { Pill } from "@/shared/ui";
import { View } from "react-native";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { UserActions } from "./UserActions";

type Props = { user: UserHit | null; onClose: () => void; onEdit: (u: UserDetail) => void; on360: (u: UserDetail) => void };

// One person: identity, roles, permissions count, status and the admin actions (permission-first: users.manage).
export function UserSheet({ user, onClose, onEdit, on360 }: Props) {
  const { t, locale } = useT();
  const kept = useKept(user);
  const q = useUserDetail(user?.id ?? "");
  const can = useAccess().can("users.manage");
  const d = q.data;
  return (
    <FormSheet visible={!!user} onClose={onClose} title={kept?.name || kept?.phone || ""} subtitle={kept?.lexgoId} snaps={[0.62, 0.9]}>
      <QueryBoundary query={q}>
        {d ? (
          <>
            <FactRows rows={[
              { label: t("adm.status"), value: <StatusPill status={d.status} /> }, { label: t("ag3.facts.phone"), value: d.phone },
              { label: t("ag3.facts.role"), value: humanizeSlug(d.role) },
              { label: t("ag3.facts.roles"), value: d.roles.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "flex-end", flex: 1 }}>{d.roles.map((r) => <Pill key={r} label={humanizeSlug(r)} tone="blue" small />)}</View> : "" },
              { label: t("ag3.facts.perms"), value: d.permissions.length ? String(d.permissions.length) : "" },
              { label: t("ag3.facts.verified"), value: d.phoneVerified ? t("adm.yes") : t("adm.no") }, { label: t("ag3.facts.ref"), value: d.referralCode },
              { label: t("ag3.facts.by"), value: d.referredBy }, { label: t("ag3.facts.created"), value: fmtDateTime(d.createdAt, locale) },
            ]} />
            {can ? <UserActions user={d} onEdit={() => onEdit(d)} on360={() => on360(d)} onDone={onClose} /> : null}
          </>
        ) : null}
      </QueryBoundary>
    </FormSheet>
  );
}
