import { ScrollView, StyleSheet, type ScrollViewProps } from "react-native";
import { useTabHeader } from "./tabScroll";

// A ScrollView whose first child is the TabPage header, so the header scrolls with the page.
// It must be rendered INSIDE <TabPage>. The header cancels the content padding to stay full width.
export function TabScrollView({ children, ...rest }: ScrollViewProps) {
  const header = useTabHeader(StyleSheet.flatten(rest.contentContainerStyle)?.paddingHorizontal as number | undefined);
  return <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" {...rest}>{header}{children}</ScrollView>;
}
