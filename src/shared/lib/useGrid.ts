import { useCallback, useState } from "react";
import type { DimensionValue, LayoutChangeEvent } from "react-native";
import { dockCount } from "./dockEpoch";
import { useTablet } from "./useTablet";

// A grid of equal cards that fits as many columns as the room allows. On a phone it returns nothing (`cell` is undefined: the card keeps its own
// two-column width). On a tablet the grid measures itself: a 13" iPad sideways has room for 4 cards of 280 dp, upright for 3. Never fewer
// than two. When the number of cards is known (`count`) a column count that would leave one lonely card on the last row is traded for a
// smaller one (4 cards: 4 or 2 columns, never 3 + 1).
// Opening or closing the docked sidebar changes only the cards' width: the columns chosen before it stay (a card never drops to another row
// as the sidebar moves); turning the tablet chooses them again. A wrapping grid takes `row` and its cards `tile`: shares of the row that add
// up to all of it, so the cards follow the grid's width on the very frame it changes — the sidebar re-lays the page out on the UI thread
// before React draws again, and cards with a width in dp would not fit for that moment and fall to rows of their own. `cell` is the same
// width in dp, for lists that need a number. On a tablet the cards are drawn once the grid has been measured (`ready`), so they never show
// at a phone's width first.
const MIN = 280;

export type Grid = {
  onLayout?: (e: LayoutChangeEvent) => void;
  cell?: { width: number };
  tile?: { width: DimensionValue };
  row?: { columnGap: string };
  columns: number;
  ready: boolean;
};

const fits = (count: number, c: number): boolean => count <= c || (count % c || c) / c >= 0.5;

type Opts = { gap?: number; min?: number; count?: number; minCols?: number; inset?: number }; // inset: padding inside the measured box that the cards do not use
export type Measured = { w: number; dock: number; basis: number }; // dock: dockCount() at the measurement; basis: the width the columns are chosen for

/** The grid's next measurement: a width that changed because the docked sidebar opened or closed keeps the width its columns were chosen for. */
export function remeasure(cur: Measured | null, w: number, dock: number): Measured {
  if (cur && cur.w === w && cur.dock === dock) return cur;
  return { w, dock, basis: cur && cur.dock !== dock ? cur.basis : w };
}

/** How many columns of at least `min` fit in `room` (see the top of the file). */
export function gridColumns(room: number, { gap = 10, min = MIN, count, minCols = 2 }: Omit<Opts, "inset"> = {}): number {
  let columns = room > 0 ? Math.max(minCols, Math.floor((room + gap) / (min + gap))) : minCols;
  if (count) {
    columns = Math.min(columns, Math.max(minCols, count));
    while (columns > minCols && !fits(count, columns)) columns -= 1;
  }
  return columns;
}

export function useGrid({ gap = 10, min = MIN, count, minCols = 2, inset = 0 }: Opts = {}): Grid {
  const { tablet } = useTablet();
  const [m, setM] = useState<Measured | null>(null); // null: not measured yet
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    const dock = dockCount();
    setM((cur) => remeasure(cur, w, dock));
  }, []);
  if (!tablet) return { columns: minCols, ready: true };
  const room = (m?.w ?? 0) - inset;
  const columns = gridColumns((m?.basis ?? 0) - inset, { gap, min, count, minCols });
  if (room <= 0) return { onLayout, columns, ready: m !== null };
  const gapShare = (gap / room) * 100;
  const tileShare = (100 - gapShare * (columns - 1)) / columns - 0.01; // a hair under, so rounding never pushes the last card down
  return {
    onLayout,
    columns,
    cell: { width: Math.floor((room - gap * (columns - 1)) / columns) },
    tile: { width: `${Number(tileShare.toFixed(4))}%` },
    row: { columnGap: `${Number(gapShare.toFixed(4))}%` },
    ready: true,
  };
}

/** The cell style for tiles that size themselves by `flexBasis` + `flexGrow` (they would otherwise ignore a width): a fixed cell on a tablet, nothing on a phone. */
export const fixedCell = (cell?: { width: DimensionValue }) => (cell ? ({ width: cell.width, flexBasis: cell.width, flexGrow: 0 } as const) : undefined);
