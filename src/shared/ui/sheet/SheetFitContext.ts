import { createContext, useContext } from "react";

// A sheet scroller reports how tall its content is and how much room it was given; the sheet
// uses that to hug short content instead of leaving an empty gap under it.
export type SheetFit = { report: (viewport: number, content: number) => void; setHeader: (h: number) => void; setWrap: (h: number) => void };

export const SheetFitContext = createContext<SheetFit | null>(null);
export const useSheetFit = () => useContext(SheetFitContext);
