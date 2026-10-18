import type { ReactNode } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { KeyboardLift } from "../admin/KeyboardLift";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";

type Props = { children: ReactNode; refreshing?: boolean; onRefresh?: () => void; keyboard?: boolean };

// Scrollable body of a PAY page under the AdminPage header: pull to refresh, safe-area gap,
// and (for forms) lifted above the keyboard.
export function PayScroll({ children, refreshing, onRefresh, keyboard }: Props) {
  const c = useColors();
  const insets = useInsets();
  const body = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={c.accent} /> : undefined}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, gap: 14, paddingBottom: insets.bottom + 28 }}
    >
      {children}
    </ScrollView>
  );
  return keyboard ? <KeyboardLift>{body}</KeyboardLift> : body;
}
