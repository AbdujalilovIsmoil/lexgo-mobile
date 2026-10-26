import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SERVICE_STATUSES, canEdit, canPromote, useRemoveService, useServiceStatus, type ProService, type ServiceStatus } from "@/entities/pro-service";
import { BottomSheet, Button, Icon, PressableScale, Pill, Segmented, SheetScroll, Text, confirmDialog, type IconName } from "@/shared/ui";
import { Notice } from "@/shared/ui/sel";
import { useKept } from "@/shared/lib/useKept";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { PriceGauge } from "./PriceGauge";
import { VisibilityCard } from "./VisibilityCard";

// Integration slots (texts come from the caller): `banner` sits above the status control (e.g. a rules banner), `extra` under the note
// (marketplace configuration: negotiation, price explanation, requirements), `lock` blocks switching a service to "active".
export type SheetLock = { reason: string; actionLabel: string; onOpen: () => void };
type Props = {
  item: ProService | null;
  verified: boolean;
  waiting?: boolean;
  banner?: ReactNode;
  extra?: (item: ProService) => ReactNode;
  lock?: SheetLock | null;
  onClose: () => void;
  onEdit: (s: ProService) => void;
  onPromote: (s: ProService) => void;
};

// A round action of the bottom bar (promote, remove): an icon, its name as the accessibility label, dimmed when it cannot be used.
function RoundAction({ icon, label, onPress, disabled, danger }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean; danger?: boolean }) {
  const c = useColors();
  return (
    <PressableScale onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} style={[s.round, { backgroundColor: danger ? c.errBg : c.tint2, opacity: disabled ? 0.45 : 1 }]}>
      <Icon name={icon} size={20} color={danger ? c.err : c.accentStrong} />
    </PressableScale>
  );
}

// One service in detail, as blocks: the status switch, the price on its corridor bar, the "why is it (not) listed" checklist, the note,
// the marketplace settings (slot), and a sticky bar with Edit (primary), Promote and Remove (round icon buttons).
export function ServiceSheet({ item: current, verified, waiting = false, banner, extra, lock, onClose, onEdit, onPromote }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const item = useKept(current);
  const status = useServiceStatus();
  const remove = useRemoveService();
  const change = (next: ServiceStatus) => item && next !== item.status && !(lock && next === "active") && status.mutate({ id: item.id, status: next });
  const ask = () =>
    item &&
    confirmDialog({
      title: t("proSvc.remove.title"),
      message: [t("proSvc.remove.text", { title: item.name }), item.promotion ? t("proSvc.remove.promoWarn") : ""].filter(Boolean).join("\n\n"),
      confirmLabel: t("proSvc.remove.confirm"),
      cancelLabel: t("proSvc.form.cancel"),
      icon: "trash-2",
      danger: true,
      onConfirm: async () => {
        await remove.mutateAsync(item.id).catch(() => undefined);
        onClose();
      },
    });
  const promoteHint = item ? (item.promotion ? t("proSvc.card.promotedHint", { days: item.promotion.daysLeft }) : waiting ? t("proSvc.card.pendingHint") : !canPromote(item, waiting) ? t("proSvc.card.promoteInactive") : "") : "";
  return (
    <BottomSheet visible={!!current} onClose={onClose} title={item?.name ?? ""} subtitle={[item?.categoryTitle, item?.subcategory].filter(Boolean).join(" · ")} snaps={[0.8, 0.95]}>
      <SheetScroll contentContainerStyle={s.body}>
        {item ? (
          <>
            {banner}
            <View style={s.block}>
              <Segmented<ServiceStatus> options={SERVICE_STATUSES.map((x) => ({ value: x, label: t(`proSvc.status.${x}`) }))} value={item.status} onChange={change} />
              <Text variant="caption" tone="gray">{t(`proSvc.statusHint.${item.status}`)}</Text>
              {lock ? (
                <View style={s.block}>
                  <Notice tone="warn" icon="lock" text={lock.reason} />
                  <Button title={lock.actionLabel} variant="soft" size="sm" onPress={lock.onOpen} />
                </View>
              ) : null}
            </View>
            <PriceGauge item={item} />
            <VisibilityCard item={item} verified={verified} />
            <PressableScale onPress={() => canEdit(item) && onEdit(item)} disabled={!canEdit(item)} accessibilityRole="button" accessibilityLabel={t("proSvc.form.note")} style={[s.note, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
              <View style={s.noteHead}>
                <Text variant="caption" tone="gray" weight="bold">{t("proSvc.form.note")}</Text>
                {canEdit(item) ? <Icon name="edit-2" size={14} tone="gray" /> : null}
              </View>
              {item.note ? <Text variant="small">{item.note}</Text> : <Text variant="small" tone="accent">{t("proSvc.card.noteEmpty")}</Text>}
            </PressableScale>
            {item.promotion || waiting ? (
              <View style={s.promo}>
                {item.promotion ? <Pill label={t("proSvc.card.promoted", { days: item.promotion.daysLeft })} tone="cy" icon="radio" /> : <Pill label={t("proSvc.card.pending")} tone="warn" icon="clock" />}
              </View>
            ) : null}
            {canEdit(item) ? null : <Notice tone="warn" icon="lock" text={t("proSvc.card.editLocked")} />}
            {extra?.(item)}
            {promoteHint ? <Text variant="caption" tone="gray">{promoteHint}</Text> : null}
          </>
        ) : null}
      </SheetScroll>
      {item ? (
        <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
          <Button title={t("proSvc.card.edit")} icon="edit-2" variant="gradient" disabled={!canEdit(item)} onPress={() => onEdit(item)} style={s.edit} full />
          <RoundAction icon={waiting && !item.promotion ? "clock" : "radio"} label={item.promotion ? t("proSvc.card.promotedShort") : t("proSvc.card.promote")} disabled={!canPromote(item, waiting)} onPress={() => onPromote(item)} />
          <RoundAction icon="trash-2" label={t("proSvc.card.remove")} danger disabled={remove.isPending} onPress={ask} />
        </View>
      ) : null}
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { paddingTop: 12, gap: 14 },
  block: { gap: 8 },
  note: { gap: 6, padding: 16, borderRadius: 20, borderWidth: 1 },
  noteHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  promo: { flexDirection: "row" },
  bar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 18, paddingTop: 10, borderTopWidth: 1 },
  edit: { flex: 1 },
  round: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
});
