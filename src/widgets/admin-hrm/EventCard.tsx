import { useState } from "react";
import { EmployeeSelect } from "@/entities/admin-hrm";
import { AttendanceButtons } from "@/features/admin-hrm";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Record an attendance event for any employee (or for yourself when none is chosen) — internal_time.manage.
export function EventCard() {
  const { t } = useT();
  const [who, setWho] = useState("");
  return (
    <SectionCard title={t("admHrmC.recordEvent")}>
      <EmployeeSelect label={t("admHrmC.employee")} value={who} onChange={setWho} none={t("admHrmC.me")} />
      <AttendanceButtons employeeId={who || undefined} />
    </SectionCard>
  );
}
