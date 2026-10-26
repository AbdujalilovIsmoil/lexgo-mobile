import { useState, type ReactElement, type ReactNode } from "react";
import { ScrollView, View, useWindowDimensions, type RefreshControlProps, type StyleProp, type ViewStyle } from "react-native";

type Props<T> = {
  items: readonly T[];
  keyOf: (item: T, index: number) => string;
  /** Card width for the rail's own width (measured: a padded parent or the tablet's docked sidebar makes it narrower than the window). */
  cardWidth: (railWidth: number) => number;
  renderItem: (item: T, cardWidth: number, index: number) => ReactNode;
  gap?: number;
  /** The card that is in the middle now (called while scrolling; equal values in a row are cheap for a useState setter). */
  onPage?: (index: number) => void;
  align?: ViewStyle["alignItems"];
  style?: StyleProp<ViewStyle>;
  refreshControl?: ReactElement<RefreshControlProps>;
  accessibilityLabel?: string;
};

// A swipeable row of cards that snaps one card into the middle. Both ends are padded by half of the free width, so every snapped card is
// centred and its two neighbours peek out by the same amount (a start-aligned snap left a sliver on the left and a wide strip on the
// right). One swipe moves one card.
export function Carousel<T>({ items, keyOf, cardWidth, renderItem, gap = 12, onPage, align = "stretch", style, refreshControl, accessibilityLabel }: Props<T>) {
  const { width: windowW } = useWindowDimensions();
  const [railW, setRailW] = useState(windowW); // the window until the rail has reported its own width
  const w = Math.min(Math.round(cardWidth(railW)), railW);
  const step = w + gap;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={step}
      disableIntervalMomentum
      onLayout={(e) => setRailW(e.nativeEvent.layout.width)}
      onScroll={onPage ? (e) => onPage(Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.x / step)))) : undefined}
      scrollEventThrottle={onPage ? 32 : undefined}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      accessibilityLabel={accessibilityLabel}
      style={style}
      contentContainerStyle={{ paddingHorizontal: (railW - w) / 2, gap, alignItems: align }}
    >
      {items.map((item, i) => <View key={keyOf(item, i)} style={{ width: w }}>{renderItem(item, w, i)}</View>)}
    </ScrollView>
  );
}
