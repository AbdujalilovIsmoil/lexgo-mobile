import { NotificationBanner } from "@/widgets/notification-banner";
import { AnalyticsMount } from "../../analytics/AnalyticsMount";
import { CacheMount } from "../../cache/CacheMount";
import { LinkMount } from "../../links/LinkMount";
import { NetworkMount } from "../../network/NetworkMount";
import { CalendarReminders } from "../../push/CalendarReminders";
import { PushMount } from "../../push/PushMount";

// App-level mount point of the Infra package (rendered once inside the app providers): connectivity
// + offline banner, local cache lifecycle, analytics, notification alerts / taps / background job,
// deep-link router and the in-app notification banner.
export function InfraMounts() {
  return (
    <>
      <NetworkMount />
      <CacheMount />
      <AnalyticsMount />
      <PushMount />
      <CalendarReminders />
      <LinkMount />
      <NotificationBanner />
    </>
  );
}
