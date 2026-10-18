import { useSupportAlerts, useSupportBadge } from "@/features/support";
import { AssistHost } from "@/widgets/support";

function Watchers() {
  useSupportBadge();
  useSupportAlerts();
  return null;
}

// App-level mount point of the Sup package: the unread-support badge and the global preview sheet for
// what an operator prepares on the client's behalf (TZ 33). Rendered once inside the app providers.
export function SupMounts() {
  return (
    <>
      <Watchers />
      <AssistHost />
    </>
  );
}
