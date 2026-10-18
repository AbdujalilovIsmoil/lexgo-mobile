import { useState } from "react";
import { HrmStatus, useEmployee360, useNames, type Employee } from "@/entities/admin-hrm";
import { FactRows, FormSheet, QueryBoundary } from "@/shared/ui/admin";
import { Segmented } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { Employee360Lists, type Tab360 } from "./Employee360Lists";
import { EmployeeHead } from "./EmployeeHead";

type Props = { employee: Employee | null; onClose: () => void; onEdit: (e: Employee) => void; onAssign: (e: Employee) => void; onMessage?: (e: Employee) => void };
const TABS = ["info", "work", "time", "money"] as const;
const TAB_KEY = { info: "tInfo", work: "tWork", time: "tTime", money: "tMoney" } as const;

// Employee 360: header with call / message, then tabs (facts + counters, tasks, attendance, KPI / payroll); edit / assign from here.
export function EmployeeSheet({ employee: current, onClose, onEdit, onAssign, onMessage }: Props) {
  const { t, locale } = useT();
  const [tab, setTab] = useState<Tab360>("info");
  const kept = useKept(current);
  const q = useEmployee360(current?.id ?? "");
  const names = useNames();
  const e = q.data?.employee ?? kept;
  const a = e?.assignment;
  return (
    <FormSheet
      visible={!!current} onClose={onClose} title={e?.name ?? ""} subtitle={e?.code} snaps={[0.8, 0.95]}
      onSubmit={e ? () => onEdit(e) : undefined} submitLabel={t("admHrmB.editProfile")} secondary={e ? { label: t("admHrmB.assignment"), onPress: () => onAssign(e) } : undefined}
    >
      {e ? (
        <>
          <EmployeeHead e={e} onMessage={onMessage} place={a ? [names.position(a.positionId), names.unit(a.unitId)].filter(Boolean).join(" · ") : ""} />
          <Segmented options={TABS.map((k) => ({ value: k, label: t(`admHrmU.${TAB_KEY[k]}`) }))} value={tab} onChange={setTab} />
          {tab === "info" ? (
            <FactRows rows={[
              { label: t("adm.status"), value: <HrmStatus status={e.status} /> }, { label: t("adm.phone"), value: e.phone }, { label: "Email", value: e.email }, { label: t("admHrmB.region"), value: e.region },
              { label: t("admHrmB.unit"), value: a ? names.unit(a.unitId) : "" }, { label: t("admHrmB.position"), value: a ? names.position(a.positionId) : "" },
              { label: t("admHrmB.manager"), value: a ? names.employee(a.managerId) : "" }, { label: t("admHrmB.salary"), value: a?.salary ? `${fmtMoney(a.salary)} ${t("adm.currency")}` : "" },
              { label: t("admHrm.hired"), value: fmtDate(e.hireDate, locale) },
            ]} />
          ) : null}
          <QueryBoundary query={q}>{q.data ? <Employee360Lists data={q.data} tab={tab} /> : <></>}</QueryBoundary>
        </>
      ) : null}
    </FormSheet>
  );
}
