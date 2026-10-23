import { type ReactNode } from "react";
import { Platform, RefreshControl, StyleSheet, View, type ScrollViewProps } from "react-native";
import { useAnimatedScrollHandler } from "react-native-reanimated";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useInsets } from "@/shared/lib/insets";
import { useTablet } from "@/shared/lib/useTablet";
import { usePageChrome, useHeaderHeight } from "@/shared/lib/pageChrome";
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
  const { tablet } = useTablet();
  const extra = StyleSheet.flatten(contentContainerStyle) ?? {};
  const top = topInset ? insets.top : 0;
  // iOS, under a stack header (topInset off): the page runs up beneath the header, which blurs as the page scrolls (Header reads `y`).
  const chrome = usePageChrome();
  const headerH = useHeaderHeight(chrome);
  const bleed = Platform.OS === "ios" && !topInset && headerH > 0 ? headerH : 0;
  const y = chrome.y;
  const onScroll = useAnimatedScrollHandler((e) => {
    // eslint-disable-next-line react-hooks/immutability
    y.value = e.contentOffset.y;
  });
  const padding = {
    paddingTop: top + bleed + (typeof extra.paddingTop === "number" ? extra.paddingTop : 0),
    paddingBottom: typeof extra.paddingBottom === "number" ? extra.paddingBottom : bottomInset ? insets.bottom + 24 : 0,
  };
  const body = scroll ? (
    <KeyboardAwareScrollView
      bottomOffset={24}
      {...rest}
      {...(!topInset && Platform.OS === "ios" ? { onScroll } : null)}
      style={s.fill}
      contentContainerStyle={[extra, padded && s.padded, padding, tablet && s.column]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={c.accent} progressViewOffset={top + bleed} /> : undefined}
    >
      {children}
    </KeyboardAwareScrollView>
  ) : (
    <View style={[s.fill, padded && s.padded, padding, tablet && s.column]}>{children}</View>
  );
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }, bleed ? { marginTop: -bleed } : null]}>
      {body}
      {top > 0 ? <View pointerEvents="none" style={[s.mask, { height: top, backgroundColor: c.canvas }]} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  padded: { paddingHorizontal: 16 },
  // A tablet reads a page as one centred column, not as a phone page stretched over 1000+ dp.
  column: { width: "100%", maxWidth: 860, alignSelf: "center" },
  mask: { position: "absolute", top: 0, left: 0, right: 0 },
});
