import { alertText, foldNotifications, getPrefs, listRows, localPrefs, serverUnreadRows, useLocalPrefs, type Prefs } from "@/entities/notification";
import { raEventOf } from "@/entities/remote-assist";
import { useSessionStore } from "@/entities/session";
import { useLocaleStore } from "@/shared/i18n/localeStore";
import { translate } from "@/shared/i18n/useT";
import { showLocalAlert } from "@/shared/push";
import { advanceWatermark, readWatermark } from "./seen";

const MAX_ALERTS = 4;

// A remote-assistance row alerts only as a new request (its tap opens the consent sheet); its other events are not news for the lock screen.
const raQuiet = (n: { event: string; data: Record<string, unknown> }): boolean => {
  const ra = raEventOf(n);
  return !!ra && ra !== "remote_assist.requested";
};

const topicOff = (p: Prefs | null, category: string): boolean =>
  !!p && (p.push === false || (category === "orders" && p.orders === false) || (category === "payments" && p.payments === false) || (category === "chat" && p.messages === false) || (category === "marketing" && p.marketing === false));

/**
 * The periodic check (background task): newest unread rows after the watermark → one OS alert per
 * new event. Runs without any screen mounted: it restores the session and the language itself.
 * The first run only sets the watermark, so an old backlog is never announced. Returns the number
 * of alerts shown. Nothing is logged; the token never leaves SecureStore/http().
 */
export async function pollNotifications(): Promise<number> {
  if (!useSessionStore.getState().session) await useSessionStore.getState().hydrate();
  if (!useSessionStore.getState().session) return 0;
  await useLocalPrefs.persist.rehydrate();
  await useLocaleStore.persist.rehydrate();
  if (!localPrefs().background) return 0;
  if ((await serverUnreadRows()) === 0) return 0; // GET /notifications/unread-count: the cheap gate
  const rows = await listRows({ offset: 0, unreadOnly: true, limit: 50 });
  const mark = await readWatermark();
  if (!rows.length) return 0;
  const newest = rows.reduce((a, r) => (r.createdAt > a ? r.createdAt : a), "");
  if (!mark) {
    await advanceWatermark(newest);
    return 0;
  }
  const fresh = foldNotifications(rows.filter((r) => r.createdAt > mark)).filter((n) => !n.read);
  await advanceWatermark(newest);
  if (!fresh.length) return 0;
  const prefs = await getPrefs().catch(() => null);
  const locale = useLocaleStore.getState().locale;
  const t = (key: string, p?: Record<string, string | number>) => translate(locale, key, p);
  let shown = 0;
  for (const n of fresh.filter((x) => !topicOff(prefs, x.category) && !raQuiet(x)).slice(0, MAX_ALERTS)) {
    if (await showLocalAlert({ id: `bg-${n.id}`, ...alertText(n, t), category: n.category, event: raEventOf(n) || n.event, data: n.data, ids: n.ids, sound: localPrefs().sound })) shown += 1;
  }
  const rest = fresh.length - MAX_ALERTS;
  if (rest > 0 && shown) await showLocalAlert({ id: "bg-more", title: t("nt2.alert.more", { n: rest }), body: t("nt2.alert.moreBody"), category: "system", event: "", data: {} });
  return shown;
}
