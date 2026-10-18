import { StyleSheet, View } from "react-native";
import { CATEGORY_COLOR, CATEGORY_ICON, eventText, linkInputOf, type Notification } from "@/entities/notification";
import { useOrders } from "@/entities/order";
import { useOpenLink } from "@/features/open-link";
import { BottomSheet, Button, Icon, Pill, SheetScroll, Text, type IconName } from "@/shared/ui";
import { fmtDate, fmtTime } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { asStr } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { NotifFacts } from "./NotifFacts";
import { notifFacts } from "./notifInfo";

// One notification in a drawer: category badge, time, full text, the facts that matter (never raw
// ids) and, where this viewer has a screen for it, a button that opens it (role-aware deep link).
export function NotificationSheet({ item, onClose }: { item: Notification | null; onClose: () => void }) {
  const { t, locale } = useT();
  const { open, resolve } = useOpenLink();
  const n = useKept(item);
  const { data: orders } = useOrders();
  const workId = n ? (orders?.find((o) => o.id === asStr(n.data.order_id))?.workId ?? "") : "";
  const req = n ? { input: linkInputOf(n) } : null;
  const res = req ? resolve(req) : null;
  const target = res?.kind === "target" ? res.target : null;
  const tone = n ? CATEGORY_COLOR[n.category] : "#64748B";
  const text = n ? eventText(n, t, workId) : null;
  const go = () => {
    if (!req) return;
    onClose();
    setTimeout(() => void open(req, "notification_sheet"), 340);
  };
  return (
    <BottomSheet visible={!!item} onClose={onClose} title={t("notif.title")} snaps={[0.6, 0.92]}>
      <SheetScroll>
        {n && text ? (
          <>
            <View style={s.head}>
              <View style={[s.badge, { backgroundColor: `${tone}24` }]}><Icon name={CATEGORY_ICON[n.category] as IconName} size={26} color={tone} /></View>
              <View style={s.meta}>
                <View style={s.pills}>
                  <Pill label={t(`notif.cats.${n.category}`)} tone="blue" small />
                  {!n.read ? <Pill label={t("notif.new")} tone="cy" small /> : null}
                </View>
                <Text variant="caption" tone="gray">{fmtDate(n.createdAt, locale)} · {fmtTime(n.createdAt)}</Text>
              </View>
            </View>
            <Text variant="h3">{text.title}</Text>
            <Text variant="body" tone="gray" selectable style={s.body}>{text.body}</Text>
            <NotifFacts facts={notifFacts(n, t, workId)} channels={n.channels} />
            {target ? <Button title={t(`nt4.open.${target.label}`)} onPress={go} variant="gradient" icon="arrow-right" iconRight full /> : null}
          </>
        ) : null}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 14 },
  badge: { width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  meta: { flex: 1, gap: 6 },
  pills: { flexDirection: "row", gap: 6 },
  body: { lineHeight: 24 },
});
