import { StyleSheet, View } from "react-native";
import { BottomSheet, Icon, SheetScroll, Text } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { useKept } from "@/shared/lib/useKept";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useTicket } from "@/entities/support";
import { useAssistStore } from "@/features/support";
import { AssistActions } from "./AssistActions";
import { useAssistRows } from "./useAssistRows";

// Global preview of what an operator prepared on the client's behalf (TZ 10, 33): what, how much, for whom,
// and where it stands. The client confirms payments in Telegram; this sheet never marks anything paid.
export function AssistSheet() {
  const { t } = useT();
  const c = useColors();
  const openKey = useAssistStore((s) => s.openKey);
  const cards = useAssistStore((s) => s.cards);
  const shown = useKept(cards.find((x) => x.key === openKey) ?? null);
  const ticket = useTicket(shown?.ticketId ?? "").data;
  const rows = useAssistRows(shown, shown?.ticketWorkId || ticket?.workId || "");
  const close = () => useAssistStore.getState().close();
  if (!shown) return null;
  const note = t(`sp6.note.${shown.kind}.${shown.pay || "default"}`);
  return (
    <BottomSheet visible={openKey !== null && shown.key === openKey} onClose={close} title={t(`sp6.title.${shown.kind}`)} subtitle={t("sp6.kicker")} snaps={[0.66, 0.94]}>
      <SheetScroll>
        <View style={[s.note, { backgroundColor: c.tint2 }]}>
          <Icon name="info" size={18} color={c.accent} />
          <Text variant="small" style={s.fill}>{note.startsWith("sp6.") ? t(`sp6.note.${shown.kind}.default`) : note}</Text>
        </View>
        <FactRows rows={rows} />
        {shown.pay === "pending" ? <Text variant="caption" tone="gray">{shown.telegramSent === false ? t("sp7.tgOff") : shown.telegramSent ? t("sp7.tgSent") : t("sp7.tgGeneric")}</Text> : null}
      </SheetScroll>
      <AssistActions card={shown} onClose={close} />
    </BottomSheet>
  );
}

const s = StyleSheet.create({ note: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 16 }, fill: { flex: 1 } });
