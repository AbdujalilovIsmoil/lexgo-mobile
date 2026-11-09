import type { ImageSourcePropType } from "react-native";
import { House, Inbox, LayoutGrid, MessageCircle, ShoppingBag, Sparkles, Users, type LucideIcon } from "lucide-react-native";

// The bars' Lucide icons. `zap` is the AI tab: only its caption and the raised button show, never this icon.
const ICONS = {
  home: House,
  grid: LayoutGrid,
  "shopping-bag": ShoppingBag,
  "message-circle": MessageCircle,
  inbox: Inbox,
  users: Users,
  zap: Sparkles,
} as const satisfies Record<string, LucideIcon>;

export type TabIconName = keyof typeof ICONS;

// The same icons for the iOS system bar, which takes images: template PNGs the system tints (scripts/gen-tab-icons.mjs draws them).
export const TAB_IMAGES: Partial<Record<TabIconName, ImageSourcePropType>> = {
  home: require("../../../assets/tabs/house.png"),
  grid: require("../../../assets/tabs/layout-grid.png"),
  "shopping-bag": require("../../../assets/tabs/shopping-bag.png"),
  "message-circle": require("../../../assets/tabs/message-circle.png"),
  inbox: require("../../../assets/tabs/inbox.png"),
  users: require("../../../assets/tabs/users.png"),
};

// For the bars drawn in React Native (Android's bar, the bar on stack pages).
export function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  const Glyph = ICONS[name];
  return <Glyph size={25} color={color} />;
}
