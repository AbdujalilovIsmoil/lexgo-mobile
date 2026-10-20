import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTabHeader } from "@/widgets/tab-page";

// The top of a bottom-tab page (logo row, title) plus the page's action buttons, drawn INSIDE the list so they scroll away with
// the leads instead of staying pinned. `bleed` cancels the side padding of the list it sits in.
export function ScrollTop({ actions, bleed = 0 }: { actions: ReactNode; bleed?: number }) {
  const header = useTabHeader(bleed);
  return (
    <>
      {header}
      <View style={s.bar}>{actions}</View>
    </>
  );
}

const s = StyleSheet.create({ bar: { flexDirection: "row", justifyContent: "flex-end", gap: 6, paddingHorizontal: 16, paddingBottom: 10 } });
