import { statusText, type Notification } from "@/entities/notification";
import { asNum, asStr } from "@/shared/lib/json";
import { fmtMoney } from "@/shared/lib/money";

export type Fact = { key: string; label: string; value: string; status?: string };
type T = (key: string, params?: Record<string, string | number>) => string;

// Facts worth showing as rows — never raw ids.
export function notifFacts(n: Notification, t: T, workId: string): Fact[] {
  const d = n.data;
  const sum = asNum(d.price, 0) || asNum(d.amount, 0);
  const rows: (Fact | null)[] = [
    asStr(d.status) ? { key: "status", label: t("notif.status"), value: statusText(asStr(d.status), t), status: asStr(d.status) } : null,
    workId || asStr(d.work_id) ? { key: "number", label: t("notif.number"), value: workId || asStr(d.work_id) } : null,
    sum ? { key: "sum", label: t(d.price ? "notif.price" : "notif.amount"), value: `${fmtMoney(sum)} ${t("common.currency")}` } : null,
    asNum(d.page_count, 0) ? { key: "pages", label: t("notif.pages"), value: String(asNum(d.page_count)) } : null,
    asStr(d.main_file_name) ? { key: "file", label: t("notif.file"), value: asStr(d.main_file_name) } : null,
    asStr(d.lawyer_name) ? { key: "lawyer", label: t("notif.lawyer"), value: asStr(d.lawyer_name) } : null,
  ];
  return rows.filter((r): r is Fact => r !== null);
}
