import { useCallback, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useTablet } from "./useTablet";

// A grid of equal cards that fits as many columns as the room allows. On a phone it returns nothing (`cell` is undefined: the card keeps its own
// two-column width). On a tablet the grid measures itself, so the sidebar being open or closed is already counted: a 13" iPad sideways has room for
// 4 cards of 280 dp with the sidebar closed and 3 with it open. Never fewer than two. When the number of cards is known (`count`) a column
// count that would leave one lonely card on the last row is traded for a smaller one (4 cards: 4 or 2 columns, never 3 + 1).
const MIN = 280;

export type Grid = { onLayout?: (e: LayoutChangeEvent) => void; cell?: { width: number }; columns: number };

const fits = (count: number, c: number): boolean => count <= c || (count % c || c) / c >= 0.5;

type Opts = { gap?: number; min?: number; count?: number; minCols?: number; inset?: number }; // inset: padding inside the measured box that the cards do not use

export function useGrid({ gap = 10, min = MIN, count, minCols = 2, inset = 0 }: Opts = {}): Grid {
  const { tablet } = useTablet();
  const [w, setW] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.width);
    setW((cur) => (cur === next ? cur : next));
  }, []);
  if (!tablet) return { columns: minCols };
  const room = w - inset;
  let columns = room > 0 ? Math.max(minCols, Math.floor((room + gap) / (min + gap))) : minCols;
  if (count) {
    columns = Math.min(columns, Math.max(minCols, count));
    while (columns > minCols && !fits(count, columns)) columns -= 1;
  }
  return { onLayout, columns, cell: room > 0 ? { width: Math.floor((room - gap * (columns - 1)) / columns) } : undefined };
}

/** The cell style for tiles that size themselves by `flexBasis` + `flexGrow` (they would otherwise ignore a width): a fixed cell on a tablet, nothing on a phone. */
export const fixedCell = (cell?: { width: number }) => (cell ? ({ width: cell.width, flexBasis: cell.width, flexGrow: 0 } as const) : undefined);
