import type { QueryClient } from "@tanstack/react-query";
import { getPrefs, type PrefKey, type Prefs } from "@/entities/notification/api/prefsApi";
import { notificationKeys } from "@/entities/notification/model/keys";
import type { Notification } from "@/entities/notification/model/types";

const TOPIC: Partial<Record<Notification["category"], PrefKey>> = { orders: "orders", payments: "payments", chat: "messages", marketing: "marketing" };

// Local OS alerts follow the same switches the user set for the server cascade: "push" off, or the
// event's topic off (orders / payments / messages / marketing), means no alert on this phone either.
export async function alertAllowed(qc: QueryClient, n: Notification): Promise<boolean> {
  const prefs = qc.getQueryData<Prefs>(notificationKeys.prefs) ?? (await qc.fetchQuery({ queryKey: notificationKeys.prefs, queryFn: getPrefs, staleTime: 5 * 60_000 }).catch(() => null));
  if (!prefs) return true; // unknown: better one alert too many than a missed call
  const topic = TOPIC[n.category];
  return prefs.push !== false && (!topic || prefs[topic] !== false);
}
