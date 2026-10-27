import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { clock, msUntil, type FlowOrder, type ResolutionChoice } from "@/entities/market-flow";
import { ResolutionSheet } from "@/features/market-flow";
import { Button, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useServerNow } from "@/shared/network";

const ICON: Record<ResolutionChoice, "users" | "rotate-ccw"> = { reassign: "users", refund: "rotate-ccw" };

// "Alternative specialist or full refund" §1.3: no specialist could take the order, and the call center lets the client decide. Shown
// only while the backend says `can_choose`, with the buttons the offer lists. The countdown to the offer's deadline only draws; when it
// reaches zero the order is read again and the backend decides what comes next.
export function ResolutionCard({ orderId, flow }: { orderId: string; flow: FlowOrder }) {
  const c = useColors();
  const { t } = useT();
  const qc = useQueryClient();
  const [choice, setChoice] = useState<ResolutionChoice | null>(null);
  const offer = flow.resolution?.canChoose ? flow.resolution.offer : null;
  const end = Date.parse(offer?.deadlineAt ?? "");
  const now = useServerNow(!!offer && Number.isFinite(end), 1000, Number.isFinite(end) ? end : Infinity);
  const left = Number.isFinite(end) ? msUntil(offer?.deadlineAt ?? "", now) : Infinity;
  const expired = left === 0;
  const refetched = useRef(false);
  useEffect(() => {
    if (!expired || refetched.current) return;
    refetched.current = true;
    void qc.invalidateQueries({ queryKey: ["market-orders"] });
  }, [expired, qc]);
  if (!offer || !offer.options.length) return null;
  return (
    <View style={[s.box, { backgroundColor: expired ? c.surface2 : c.warnBg }]}>
      <View style={s.head}>
        <Icon name={expired ? "clock" : "git-branch"} size={20} color={expired ? c.gray : c.warn} />
        <Text variant="body" weight="bold" style={s.flex}>{t("mf.res.title")}</Text>
        {Number.isFinite(left) && !expired ? <Text variant="h4" style={{ color: left < 5 * 60 * 1000 ? c.err : c.warn }}>{clock(left)}</Text> : null}
      </View>
      {expired ? <Text variant="small" tone="gray">{t("mf.res.expired")}</Text> : (
        <>
          <Text variant="small" tone="gray">{t("mf.res.lead")}</Text>
          {offer.message ? (
            <View style={[s.quote, { borderLeftColor: c.warn }]}>
              <Text variant="caption" tone="gray">{t("mf.res.operator")}</Text>
              <Text variant="small">{offer.message}</Text>
            </View>
          ) : null}
          <View style={s.col}>
            {offer.options.map((o, i) => (
              <Button key={o} title={t(`mf.res.${o}`)} icon={ICON[o]} variant={i === 0 ? "gradient" : "line"} onPress={() => setChoice(o)} full />
            ))}
          </View>
        </>
      )}
      <ResolutionSheet orderId={orderId} choice={choice} onClose={() => setChoice(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: 20, padding: 16, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  quote: { borderLeftWidth: 3, paddingLeft: 10, gap: 2 },
  col: { gap: 8 },
  flex: { flex: 1 },
});
