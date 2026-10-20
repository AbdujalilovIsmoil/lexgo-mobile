import { StyleSheet, View } from "react-native";
import { Redirect, useSegments } from "expo-router";
import { useMarkAllRead, useMarkMany } from "@/entities/notification";
import { useIsAuthed } from "@/entities/session";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { Header, Icon, PressableScale } from "@/shared/ui";
import { NotificationFeed } from "./NotificationFeed";
import { useFeed } from "./useFeed";

// /notifications (stack) and the staff "Xabarnoma" tab share one body; only the frame differs.
export function NotificationsPage() {
  const c = useColors();
  const { t } = useT();
  const authed = useIsAuthed();
  const inTabs = useSegments()[0] === "(tabs)";
  const feed = useFeed();
  const markAll = useMarkAllRead();
  const markMany = useMarkMany();
  const tabPad = useTabPad();
  if (!authed) return <Redirect href="/auth/login" />;
  const shownUnread = feed.items.filter((n) => !n.read);
  // Unfiltered: mark everything (server-side); narrowed: only the shown ones (web "markShown").
  const markShown = () => (feed.filtering ? markMany.mutate(shownUnread) : markAll.mutate());
  const markAllBtn = feed.unreadTotal > 0 && shownUnread.length > 0 ? (
    <PressableScale onPress={markShown} hitSlop={8} accessibilityLabel={feed.filtering ? t("nt1.markShown") : t("profile.markAll")}>
      <Icon name="check-circle" size={22} tone="accent" />
    </PressableScale>
  ) : undefined;
  if (inTabs) return <TabPage title={t("profile.notifications")} right={markAllBtn}><NotificationFeed feed={feed} bottomPad={tabPad} /></TabPage>;
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <Header title={t("profile.notifications")} right={markAllBtn} />
      <NotificationFeed feed={feed} />
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 } });
