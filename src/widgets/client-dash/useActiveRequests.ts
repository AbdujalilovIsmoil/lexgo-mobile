import { useRouter } from "expo-router";
import { detailHref, isFinal, useMine, useUrgentLabels, type UrgentRequest } from "@/entities/urgent";
import { useOpenCases, type OpenCase } from "@/entities/open-cases";
import { useT } from "@/shared/i18n";
import type { ActiveRowData, ChipTone } from "./RequestRow";

export type ActiveRow = { key: string; row: ActiveRowData };

const toneOf = (status: string): ChipTone => (/done|closed|complete|resolved/.test(status) ? "done" : /progress|review|wait|pending|pool|claim|schedul|meeting/.test(status) ? "busy" : "open");

const headline = (status: string) =>
  status === "meeting_active" ? "ugLive" : status === "scheduled" ? "ugScheduled" : (status || "open_pool") === "open_pool" ? "ugSearching" : "ugComing";

// The client's "Faol so'rovlar": the live urgent-advocate requests (GET /urgent-advokat/requests/me) and the open cases (GET /cases), as rows.
// A case opens the /cases page: the works API behind /works/{id} is closed to the client role.
export function useActiveRequests() {
  const { t } = useT();
  const router = useRouter();
  const label = useUrgentLabels();
  const cases = useOpenCases();
  const mine = useMine();
  const caseLabel = (v: string) => { const k = `cdash.st.${v}`; const x = t(k); return x === k ? v.replace(/[_-]+/g, " ").replace(/^\w/, (m) => m.toUpperCase()) : x; };
  const urgentRow = (r: UrgentRequest): ActiveRowData => ({
    title: label.kind(r.serviceKind, r.serviceTitle),
    status: label.status(r.status),
    tone: toneOf(r.status || "open_pool"),
    id: r.workId || undefined,
    stage: t(`cdash.home.${headline(r.status)}`),
    next: r.nextAction || undefined,
    onPress: () => router.push(detailHref("client", r.id)),
  });
  const caseRow = (x: OpenCase): ActiveRowData => ({
    title: x.type || x.number,
    status: caseLabel(x.status),
    tone: toneOf(x.status),
    id: x.type && x.number ? x.number : undefined,
    stage: x.stage ? caseLabel(x.stage) : undefined,
    next: x.nextAction || undefined,
    onPress: () => router.push("/cases" as never),
  });
  const urgent: ActiveRow[] = (mine.data ?? []).filter((r) => !isFinal(r)).map((r) => ({ key: r.id, row: urgentRow(r) }));
  const open: ActiveRow[] = cases.open.map((x) => ({ key: x.id, row: caseRow(x) }));
  return {
    urgent,
    open,
    bothLoading: cases.isLoading && mine.isLoading,
    anyLoading: cases.isLoading || mine.isLoading,
    bothFailed: cases.isError && mine.isError,
    error: cases.error ?? mine.error,
    refetch: () => Promise.all([cases.refetch(), mine.refetch()]),
  };
}
