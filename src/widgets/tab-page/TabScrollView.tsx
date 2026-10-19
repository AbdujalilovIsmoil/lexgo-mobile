import { ScrollView, StyleSheet, type ScrollViewProps } from "react-native";
import { useTabHeader } from "./tabScroll";

const num = (v: unknown): number => (typeof v === "number" ? v : 0);

// A ScrollView whose first child is the TabPage header, so the header scrolls with the page.
// It must be rendered INSIDE <TabPage>. The header cancels the content padding (sides AND top), so it sits
// exactly where every other page draws it, whatever padding the page gives its body.
export function TabScrollView({ children, ...rest }: ScrollViewProps) {
  const pad = StyleSheet.flatten(rest.contentContainerStyle) ?? {};
  const header = useTabHeader(num(pad.paddingHorizontal ?? pad.padding), num(pad.paddingTop ?? pad.paddingVertical ?? pad.padding));
  return <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" {...rest}>{header}{children}</ScrollView>;
}
