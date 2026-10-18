import { useMemo, useState } from "react";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { EMPTY_FILTER, boardStats, columnTitle, leadsOf, useBoard, useBoardView, useChunks, useOperators, type Column, type Lead, type LeadFilter, type OpsSource } from "@/entities/admin-leads";
import { useMoveFlow } from "@/features/admin-leads";
import { useT } from "@/shared/i18n";

const NO_COLS: Column[] = [];
export type Mode = "board" | "list";
export type Sheet = "" | "filter" | "create" | "auto" | "cols" | "more";
export type LeadsPage = ReturnType<typeof useLeadsPage>;

// All state of the pipeline screen: the board, client-side filters, the chosen stage and which sheet is open.
export function useLeadsPage() {
  const { t } = useT();
  const access = useAccess();
  const meId = useSession()?.user.id ?? "";
  const board = useBoard();
  const cols = board.data ?? NO_COLS;
  const source: OpsSource = access.can("users.manage") ? "admin" : access.callCenter ? "cc" : "";
  const { ops, status: opsStatus } = useOperators(source);
  const [filter, setFilter] = useState<LeadFilter>(EMPTY_FILTER);
  const [picked, setStage] = useState("");
  const [mode, setMode] = useState<Mode>("board");
  const [sheet, setSheet] = useState<Sheet>("");
  const [selId, setSelId] = useState("");
  const [moveFor, setMoveFor] = useState<Lead | null>(null);
  const [pulled, setPulled] = useState(false);
  const stage = cols.some((c) => c.key === picked) ? picked : "";
  const view = useBoardView(cols, filter, meId, stage);
  const list = useChunks(view.rows, `${stage}|${Object.values(filter).join("|")}`);
  const flow = useMoveFlow(cols);
  const all = useMemo(() => leadsOf(cols), [cols]);
  // A silent background refetch must not look like a pull-to-refresh.
  const query = {
    isLoading: board.isLoading,
    isError: board.isError,
    error: board.error,
    isRefetching: pulled,
    refetch: () => { setPulled(true); return board.refetch().finally(() => setPulled(false)); },
    hasNextPage: list.more,
    fetchNextPage: list.showMore,
  };
  const stageOptions = cols.map((c, i) => ({ value: c.key, label: columnTitle(t, c), count: view.counts[i] }));
  return { mode, setMode, meId, cols, all, ops, opsStatus, filter, setFilter, stage, setStage, sheet, setSheet, selId, setSelId, moveFor, setMoveFor, view, list, flow, query, stageOptions, stats: boardStats(cols), selected: all.find((l) => l.id === selId) ?? null };
}
