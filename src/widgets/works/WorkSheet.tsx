import { StyleSheet, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { KIND_ICON, KIND_TINT, WorkStatusPill, useWork, useWorkText, type Work } from "@/entities/work";
import { useWorkNav } from "@/features/work-actions";
import { Avatar, BottomSheet, Button, Icon, IconButton, PressableScale, SheetScroll, Skeleton, Text, toast } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { WorkFact } from "./WorkFact";

// A work in a bottom sheet (the web's modal): kind chip + live status, the title, the id (tap to copy), the four facts
// (type, status, advocate, opened), the next step, the complaint text for a complaint, and — pinned — a round chat button and
// the work's own action ("Ishga o'tish") (the work's own screen); "To'liq tafsilotlar" opens the full work page.
export function WorkSheet({ work, onClose }: { work: Work | null; onClose: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const nav = useWorkNav();
  const text = useWorkText();
  const q = useWork(work?.workId ?? "");
  const w = work;
  const d = q.data;
  const tint = w ? KIND_TINT[w.kind] : c.accent;
  const leave = (fn: () => void) => { onClose(); setTimeout(fn, 330); };
  const copy = () => w && void Clipboard.setStringAsync(w.workId).then(() => toast(t("wks.copied"), "ok"));
  const canOpen = !!d && nav.canOpen(d.related);
  return (
    <BottomSheet visible={!!w} onClose={onClose} snaps={[0.7, 0.93]}>
      {w ? (
        <View style={s.fill}>
          <SheetScroll>
            <View style={s.top}>
              <View style={[s.chip, { backgroundColor: `${tint}22` }]}><Icon name={KIND_ICON[w.kind]} size={14} color={tint} /><Text variant="caption" weight="bold" style={{ color: tint }}>{text.kind(w.kind)}</Text></View>
              <WorkStatusPill status={w.status} label={w.statusLabel} small={false} />
            </View>
            <Text variant="h3">{w.title || text.kind(w.kind)}</Text>
            <PressableScale onPress={copy} accessibilityRole="button" accessibilityLabel={t("wks.id")} style={[s.id, { backgroundColor: c.surface2 }]}>
              <Text variant="caption" tone="gray" weight="bold" style={s.cap}>{t("wks.id")}</Text>
              <Text variant="body" weight="bold" style={s.flex}>{w.workId}</Text>
              <Icon name="copy" size={16} color={c.accent} />
            </PressableScale>
            <View style={s.grid}>
              <WorkFact icon="layers" label={t("wks.kind")}><Text variant="small" weight="bold">{text.kind(w.kind)}</Text></WorkFact>
              <WorkFact icon="activity" label={t("wks.status")}><Text variant="small" weight="bold">{text.status(w.status, w.statusLabel)}</Text></WorkFact>
              <WorkFact icon="user" label={t("wks.assignee")}>
                {w.assignee ? <View style={s.who}><Avatar name={w.assignee.name} size={24} /><Text variant="small" weight="bold" numberOfLines={2} style={s.flex}>{w.assignee.name}</Text></View> : <Text variant="small" tone="gray2">{t("wks.noAssignee")}</Text>}
              </WorkFact>
              <WorkFact icon="calendar" label={t("wks.opened")}><Text variant="small" weight="bold">{fmtDateTime(w.createdAt, locale)}</Text></WorkFact>
            </View>
            {w.nextAction ? (
              <View style={[s.next, { backgroundColor: c.tint }]}>
                <Icon name="arrow-right" size={16} color={c.accent} />
                <View style={s.flex}><Text variant="caption" tone="gray" weight="bold" style={s.cap}>{t("wks.next")}</Text><Text variant="small" weight="semibold" tone="accent">{text.next(w.nextAction)}</Text></View>
              </View>
            ) : null}
            {q.isLoading ? <Skeleton height={64} round={16} /> : null}
            {d?.complaints.length ? d.complaints.map((x, i) => (
              <View key={x.id || i} style={[s.complaint, { borderColor: c.glassLine, backgroundColor: c.glassFill }]}>
                <View style={s.top}><Icon name="alert-triangle" size={15} color={c.warn} /><Text variant="small" weight="bold" style={s.flex}>{t("wks.complaint")}</Text></View>
                {x.text ? <Text variant="small">{x.text}</Text> : null}
                {x.operatorNote ? <Text variant="small" tone="gray">{t("cl5.complaint.operator")}: {x.operatorNote}</Text> : null}
              </View>
            )) : null}
            <PressableScale onPress={() => leave(() => router.push({ pathname: "/works/[id]", params: { id: w.workId || w.id } }))} accessibilityRole="button" style={s.full}>
              <Text variant="small" weight="bold" tone="accent">{t("wks.full")}</Text><Icon name="chevron-right" size={15} color={c.accent} />
            </PressableScale>
          </SheetScroll>
          <View style={[s.bar, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
            {d?.roomId ? <IconButton icon="message-circle" size={52} label={t("cl4.chat")} onPress={() => leave(() => nav.chat(d.roomId))} /> : null}
            <Button title={t(`cl4.open.${w.kind}`)} icon="arrow-right" iconRight variant="gradient" full style={s.flex} onPress={() => leave(() => (canOpen && d?.related ? nav.open(d.related) : router.push({ pathname: "/works/[id]", params: { id: w.workId || w.id } })))} />
          </View>
        </View>
      ) : null}
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 28, borderRadius: 14 },
  id: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingHorizontal: 14, borderRadius: radius.r },
  cap: { textTransform: "uppercase", letterSpacing: 1, fontSize: 10 },
  flex: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  who: { flexDirection: "row", alignItems: "center", gap: 8 },
  next: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: radius.r },
  complaint: { gap: 6, padding: 14, borderRadius: radius.r, borderWidth: 1 },
  full: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 44 },
  bar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1 },
});
