import { useState } from "react";
import { roleLabel, statusLabel, type RegDetail } from "@/entities/admin-reg";
import { FactRows, StatusPill } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { Block } from "./Block";

// Sign-up data, linked account and seller profile of a request, as hairline fact rows.
export function RegFacts({ d }: { d: RegDetail }) {
  const { t, locale } = useT();
  const [now] = useState(() => Date.now());
  const dt = (v: string) => fmtDateTime(v, locale);
  const { request: r, pending: p, user: u, profile: pr } = d;
  const blocked = !!p?.blockedUntil && new Date(p.blockedUntil).getTime() > now;
  return (
    <>
      <Block title={t("admRegB.request")}>
        <FactRows rows={[
          { label: t("adm.status"), value: <StatusPill status={r.status} label={statusLabel(t, r.status)} /> },
          { label: t("admReg.roleLabel"), value: roleLabel(t, r.role) },
          { label: t("adm.phone"), value: r.phone },
          { label: "ID", value: r.workId },
          { label: t("adm.created"), value: dt(r.createdAt) },
        ]} />
      </Block>
      {p ? (
        <Block title={t("admRegB.pending")}>
          <FactRows rows={[
            { label: t("admRegB.fio"), value: p.name },
            { label: t("admRegB.region"), value: p.region },
            { label: t("adm.phone"), value: p.phone },
            { label: t("adm.status"), value: statusLabel(t, p.status) },
            { label: t("admRegB.attempts"), value: p.attempts ? String(p.attempts) : "" },
            { label: t("admRegB.blocked"), value: blocked ? dt(p.blockedUntil) : "" },
            { label: t("admRegB.expires"), value: dt(p.expiresAt) },
          ]} />
        </Block>
      ) : null}
      {u ? (
        <Block title={t("admRegB.user")}>
          <FactRows rows={[
            { label: "LexGo ID", value: u.lexgoId },
            { label: t("admRegB.fio"), value: u.name },
            { label: t("admReg.roleLabel"), value: roleLabel(t, u.role) },
            { label: t("admRegB.account"), value: statusLabel(t, u.accountStatus) },
            { label: t("adm.created"), value: dt(u.createdAt) },
          ]} />
        </Block>
      ) : null}
      {pr ? (
        <Block title={t("admRegB.profile")}>
          <FactRows rows={[
            { label: t("admRegB.region"), value: pr.region },
            { label: t("admRegB.specs"), value: pr.specializations.join(", ") },
            { label: t("admRegB.experience"), value: pr.experienceYears ? String(pr.experienceYears) : "" },
            { label: t("admRegB.verified"), value: pr.verified ? "✓" : "—" },
          ]} />
        </Block>
      ) : null}
    </>
  );
}
