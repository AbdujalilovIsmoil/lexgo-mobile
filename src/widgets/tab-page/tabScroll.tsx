import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { View } from "react-native";

type Ctx = { header: ReactNode; claim: () => void };
const TabHeaderCtx = createContext<Ctx | null>(null);
export const TabHeaderProvider = TabHeaderCtx.Provider;

// The page header (logo row + title + text + banner) as one element. A list that spreads it into its own
// ListHeaderComponent makes the whole header scroll away WITH the content; a page without such a list
// gets the header drawn above its body by TabPage. `bleed` cancels the list's horizontal padding.
export function useTabHeader(bleed = 0): ReactNode {
  const ctx = useContext(TabHeaderCtx);
  const claim = ctx?.claim;
  useEffect(() => { claim?.(); }, [claim]);
  return useMemo(() => (ctx ? <View style={{ marginHorizontal: -bleed }}>{ctx.header}</View> : null), [ctx, bleed]);
}
