import { type ReactNode } from "react";
import { RefreshControl, StyleSheet, View, type ScrollViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";

type Props = ScrollViewProps & {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  bottomInset?: boolean;
  topInset?: boolean;
};

// Page container: content starts below the status bar and never scrolls under it.
export function Screen({ children, scroll = true, padded = true, refreshing, onRefresh, bottomInset = true, topInset = true, contentContainerStyle, ...rest }: Props) {
  const c = useColors();
  const insets = useInsets();
  const extra = StyleSheet.flatten(contentContainerStyle) ?? {};
  const top = topInset ? insets.top : 0;
  const padding = {
    paddingTop: top + (typeof extra.paddingTop === "number" ? extra.paddingTop : 0),
    paddingBottom: typeof extra.paddingBottom === "number" ? extra.paddingBottom : bottomInset ? insets.bottom + 24 : 0,
  };
  const body = scroll ? (
    <KeyboardAwareScrollView
      bottomOffset={24}
      {...rest}
      style={s.fill}
      contentContainerStyle={[extra, padded && s.padded, padding]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={c.accent} progressViewOffset={top} /> : undefined}
    >
      {children}
    </KeyboardAwareScrollView>
  ) : (
    <View style={[s.fill, padded && s.padded, padding]}>{children}</View>
  );
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      {body}
      {top > 0 ? <View pointerEvents="none" style={[s.mask, { height: top, backgroundColor: c.canvas }]} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  padded: { paddingHorizontal: 16 },
  mask: { position: "absolute", top: 0, left: 0, right: 0 },
});
