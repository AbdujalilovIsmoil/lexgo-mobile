import { StyleSheet, View } from "react-native";
import { Redirect, useSegments } from "expo-router";
import { useMarkAllRead, useMarkMany } from "@/entities/notification";
import { useIsAuthed } from "@/entities/session";
import { TabPage, useTabPad } from "@/widgets/tab-page";
import { useT } from "@/shared/i18n";
import { HOME_BG } from "@/widgets/client-dash";
import { useTheme } from "@/shared/theme";
import { IconButton, SecondaryHeader } from "@/shared/ui";
import { NotificationFeed } from "./NotificationFeed";
import { useFeed } from "./useFeed";

// /notifications (stack) and the staff "Xabarnoma" tab share one body; only the frame differs.
export function NotificationsPage() {
  const { colors: c, dark } = useTheme();
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
  // Adliya: the header's white square with the check (shown while something here is unread).
  const markAllBtn = feed.unreadTotal > 0 && shownUnread.length > 0 ? (
    <IconButton icon="check" size={42} label={feed.filtering ? t("nt1.markShown") : t("profile.markAll")} onPress={markShown} />
  ) : undefined;
  if (inTabs) return <TabPage title={t("profile.notifications")} right={markAllBtn}><NotificationFeed feed={feed} bottomPad={tabPad} /></TabPage>;
  return (
    // The Adliya frame: the SecondaryHeader with only the mark-all check on the right, over Home's ground.
    <View style={[s.fill, { backgroundColor: dark ? c.canvas : HOME_BG }]}>
      <SecondaryHeader title={t("profile.notifications")} right={markAllBtn ?? <View />} />
      <NotificationFeed feed={feed} />
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 } });
