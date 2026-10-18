import { createContext, useContext, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text } from "@/shared/ui";

// Titled section: a heading outside, then the content (a grid or one card).
export function Block({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text variant="h4" style={s.title}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

export const GAP = 12;
const TileWidth = createContext<number | undefined>(undefined);
// The pixel width every tile of the surrounding grid must have (undefined until the grid has been measured).
export const useTileWidth = (): number | undefined => useContext(TileWidth);

// A real two-column grid: the container is measured, every tile gets exactly (width - gap) / 2 and the same fixed height, rows wrap,
// and an odd last tile keeps the very same size. Nothing depends on flex or on what a tile contains.
export function Grid({ children }: { children: ReactNode }) {
  const [w, setW] = useState(0);
  const tile = w > 0 ? Math.floor((w - GAP) / 2) : undefined;
  return (
    <View style={s.grid} onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}>
      {tile ? <TileWidth.Provider value={tile}>{children}</TileWidth.Provider> : null}
    </View>
  );
}

export const Panel = Card;

const s = StyleSheet.create({
  wrap: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 24 },
  title: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
});
