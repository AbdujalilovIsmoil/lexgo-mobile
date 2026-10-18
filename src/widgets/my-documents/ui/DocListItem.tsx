import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Avatar, Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { MODE_ICON, StatusBadge, flowOf, groupOf, priceOf, toneOf, useToneColor, type DocRow } from "@/entities/my-document";
import { DocCardActions } from "@/features/my-documents";
import { DocPriceLine } from "./DocPriceLine";
import { DocProgress } from "./DocProgress";

type Props = { row: DocRow; onOpen: () => void; onSend: (id: string) => void };

// One document, scannable at a glance: what it is, its status and date, the one line that says what happens next
// (tinted when it waits on the client), a slim progress bar, and a footer with who is on it and the main action.
export function DocListItem({ row, onOpen, onSend }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const color = useToneColor();
  const steps = flowOf(row);
  const s = row.status.toLowerCase();
  const group = groupOf(row.status);
  const tone = color(toneOf(row.status));
  const cancelled = s.startsWith("payment_c") || s.startsWith("payment_r");
  const now = cancelled ? "payCancelled" : row.paymentRequired && !row.fileReady ? "payWait" : "";
  const price = priceOf(row, steps?.pay === "done");
  const you = group === "draft" || group === "payment" || !!now;
  const hint = now ? `${t(`dm11.${now}.title`)} — ${t(`dm11.${now}.text`)}` : row.mode === "lawyer" && !row.fileReady && s !== "closed" ? t("dm11.nextLawyer") : group !== "closed" ? t(`dm2.next.${group}`) : "";
  return (
    <Animated.View entering={FadeInDown.duration(260)}>
      <PressableScale onPress={onOpen} accessibilityRole="button" style={[st.card, { backgroundColor: c.surface, borderColor: c.line }]}>
        <View style={st.head}>
          <View style={[st.tile, { backgroundColor: `${tone}22` }]}><Icon name={MODE_ICON[row.mode]} size={20} color={tone} /></View>
          <View style={st.col}>
            <Text variant="body" weight="bold" numberOfLines={2}>{row.title || t("dm1.untitled")}</Text>
            <Text variant="caption" tone="gray" numberOfLines={1}>{[row.workId, row.requestedType].filter(Boolean).join(" · ")}</Text>
          </View>
          <Icon name="chevron-right" size={18} color={c.gray2} />
        </View>
        <View style={st.meta}>
          <StatusBadge status={row.status} label={row.statusLabel} />
          <Text variant="caption" tone="gray">{fmtDate(row.createdAt, locale)}</Text>
          {row.fileReady ? <Pill label={(row.format || "docx").toUpperCase()} tone="ok" icon="file-text" small /> : null}
          {row.rating.submitted && row.rating.value ? <Pill label={`${row.rating.value}/5`} tone="warn" icon="star" small /> : null}
          {row.meeting === "active" ? <Pill label={t("dm1.meetingActive")} tone="ok" icon="video" small /> : null}
        </View>
        {hint ? (
          <View style={[st.hint, you && st.tinted, you && { backgroundColor: c.warnBg }]}>
            {you ? <Icon name="alert-circle" size={15} color={c.warn} /> : null}
            <Text variant="caption" weight={you ? "semibold" : "regular"} tone={group === "ready" ? "ok" : you ? "ink" : "gray"} style={st.flex}>{hint}</Text>
          </View>
        ) : null}
        {steps ? <DocProgress steps={steps} /> : null}
        {price ? <DocPriceLine price={price} /> : null}
        <View style={st.foot}>
          <View style={st.who}>
            {row.lawyer ? <><Avatar name={row.lawyer} size={26} /><Text variant="caption" tone="gray" numberOfLines={1} style={st.flex}>{row.lawyer}</Text></> : <Pill label={t(`dm1.mode.${row.mode}`)} tone="gray" icon={MODE_ICON[row.mode]} small />}
          </View>
          <DocCardActions row={row} onSend={onSend} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  card: { gap: 12, padding: 14, borderRadius: 22, borderWidth: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  tile: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
  meta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  hint: { flexDirection: "row", alignItems: "center", gap: 8 },
  tinted: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12 },
  foot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  who: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  flex: { flex: 1 },
});
