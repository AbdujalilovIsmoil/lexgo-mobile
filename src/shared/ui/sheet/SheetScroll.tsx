import { ScrollView, type ScrollViewProps } from "react-native";
import { useInsets } from "@/shared/lib/insets";

// Scrollable body of a sheet with the safe-area gap at the bottom and a gap at the top, so nothing sticks to the title or the handle.
export function SheetScroll({ contentContainerStyle, ...rest }: ScrollViewProps) {
  const insets = useInsets();
  return <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled keyboardShouldPersistTaps="handled" contentContainerStyle={[{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: insets.bottom + 24, gap: 16 }, contentContainerStyle]} {...rest} />;
}
