import { StyleSheet, View } from "react-native";
import { LeadScopeProvider } from "@/entities/admin-leads";
import { LeadsScreen } from "@/widgets/admin-leads";

// The lead funnel of the duty desk: the same screen as the sales funnel (Kanban / list, stages, filters, create, move with a
// "lost" reason, assignment, timeline) on the call-center endpoints, with its actions in a row above the body.
export function BoardPanel({ bottomPad = 0 }: { bottomPad?: number } = {}) {
  return (
    <LeadScopeProvider value="cc">
      <LeadsScreen
        bottomPad={bottomPad || undefined}
        frame={({ actions, children }) => (
          <View style={s.fill}>
            <View style={s.bar}>{actions}</View>
            {children}
          </View>
        )}
      />
    </LeadScopeProvider>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 }, bar: { flexDirection: "row", justifyContent: "flex-end", gap: 6, paddingHorizontal: 16, paddingBottom: 10 } });
