import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useChecklist, type CheckItem } from "@/entities/market-flow";
import { ChecklistItemSheet } from "@/features/market-flow";
import { Icon, PressableScale, Pill, Skeleton, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { orderId: string; url: string; role: "client" | "seller"; editable?: boolean; locked?: boolean; roomId?: string; enabled?: boolean };

// TZ §4 / §9: the order's checklist. The client follows the progress live (read-only); the seller ticks items off with the proof the backend
// asks for. A finished order's list no longer changes.
export function ChecklistCard({ orderId, url, role, editable = false, locked = false, roomId = "", enabled = true }: Props) {
  const c = useColors();
  const { t } = useT();
  const q = useChecklist(orderId, url, enabled && !!url);
  const [open, setOpen] = useState<CheckItem | null>(null);
  if (!url || !enabled) return null;
  const list = q.data;
  // An empty list means something only to a seller who is still working; elsewhere the card stays out of the way.
  if (!q.isLoading && !q.isError && list && !list.items.length && (role === "client" || locked || !editable)) return null;
  const p = list?.progress;
  const canEdit = editable && !locked;
  return (
    <SectionCard title={t("mf.ck.title")}>
      {q.isLoading ? <Skeleton height={56} round={14} /> : q.isError || !list ? <Text variant="small" tone="gray">{t("mf.ck.error")}</Text> : !list.items.length ? <Text variant="small" tone="gray">{t("mf.ck.empty")}</Text> : (
        <View style={s.col}>
          <Text variant="caption" tone="gray">{t(role === "seller" ? "mf.ck.leadSeller" : "mf.ck.leadClient")}</Text>
          {p ? (
            <View style={s.col6}>
              <View style={[s.track, { backgroundColor: c.surface2 }]}><View style={[s.bar, { width: `${Math.max(0, Math.min(100, p.percent))}%`, backgroundColor: p.percent >= 100 ? c.ok : c.accent }]} /></View>
              <View style={s.rowSpread}>
                <Text variant="caption" weight="semibold">{t("mf.ck.progress", { done: p.done, total: p.total })}</Text>
                {p.requiredTotal ? <Text variant="caption" tone="gray">{t("mf.ck.progressRequired", { done: p.requiredDone, total: p.requiredTotal })}</Text> : null}
              </View>
            </View>
          ) : null}
          {list.items.map((it) => {
            const done = it.status === "done";
            const skipped = it.status === "skipped_with_reason";
            const title = role === "client" ? it.clientTitle || it.title : it.title;
            const marks = role === "seller" && it.status === "pending" ? [it.required && "required", it.commentRequired && "comment", it.fileRequired && "file", it.imageRequired && "image"].filter(Boolean) as string[] : [];
            const body = (
              <View style={[s.item, { borderColor: c.line }]}>
                <Icon name={done ? "check-circle" : skipped ? "skip-forward" : "circle"} size={18} color={done ? c.ok : skipped ? c.warn : c.gray} />
                <View style={s.flex}>
                  <Text variant="small" weight="semibold">{title}</Text>
                  {skipped && it.comment ? <Text variant="caption" tone="gray">{`${t("mf.ck.reasonPrefix")}: ${it.comment}`}</Text> : done && it.comment && role === "seller" ? <Text variant="caption" tone="gray">{it.comment}</Text> : null}
                  {it.files.length + it.images.length ? <View style={s.files}><Icon name="paperclip" size={12} tone="gray" /><Text variant="caption" tone="gray2">{it.files.length + it.images.length}</Text></View> : null}
                  {marks.length ? <View style={s.marks}>{marks.map((m) => <Pill key={m} label={t(`mf.ck.mark.${m}`)} tone={m === "required" ? "warn" : "gray"} small />)}</View> : null}
                </View>
                {canEdit ? <Icon name="chevron-right" size={18} tone="gray" /> : <Text variant="caption" tone={done ? "ok" : skipped ? "warn" : "gray"}>{t(`mf.ck.status.${it.status}`)}</Text>}
              </View>
            );
            return canEdit ? <PressableScale key={it.id} onPress={() => setOpen(it)} accessibilityRole="button" accessibilityLabel={`${t("mf.ck.edit")}: ${title}`}>{body}</PressableScale> : <View key={it.id}>{body}</View>;
          })}
          {editable && locked ? <Text variant="caption" tone="gray2">{t("mf.ck.locked")}</Text> : null}
        </View>
      )}
      {editable ? <ChecklistItemSheet orderId={orderId} item={open} roomId={list?.uploadRoomId || roomId} onClose={() => setOpen(null)} /> : null}
    </SectionCard>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  col6: { gap: 6 },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  bar: { height: 8, borderRadius: 4 },
  rowSpread: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderTopWidth: 1 },
  flex: { flex: 1, gap: 2 },
  marks: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  files: { flexDirection: "row", alignItems: "center", gap: 4 },
});
