import { useState } from "react";
import { useWindowDimensions, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { BusinessHoursBadge } from "@/entities/business-hours";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { BottomSheet, SheetScroll } from "@/shared/ui/sheet";
import { useInsets } from "@/shared/lib/insets";
import { openTel } from "@/shared/lib/links";
import { SUPPORT_PHONE } from "@/shared/config/env";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ComplaintSheet } from "@/features/rating";
import { SupportButton } from "./SupportButton";
import { OperatorCard } from "./OperatorCard";
import { SupportItem } from "./SupportItem";

type Props = { glass?: boolean; client: boolean };

// Header headset (web SupportMenu): a sheet with the operator chat (-> hub with `?new=1`, the new-chat window open), a complaint (clients only),
// the phone call with today's working hours, and a link to the help hub.
export function SupportMenu({ glass, client }: Props) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const { height: H } = useWindowDimensions();
  const insets = useInsets();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(0);
  const [complaint, setComplaint] = useState(false);
  // First snap = the measured content + sheet header + safe area, so it fits any screen and font size; the second opens it almost full.
  const fit = Math.min(0.92, ((body || (client ? 440 : 330)) + 14 + 96 + insets.bottom + 24) / H);
  const go = (path: string) => { setOpen(false); router.push(path as never); };
  return (
    <>
      <SupportButton glass={glass} active={open} label={t("cpd.support.label")} onPress={() => setOpen(true)} />
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t("cpd.support.title")} subtitle={t("cpd.support.sub")} snaps={fit < 0.92 ? [fit, 0.92] : [0.92]}>
        <SheetScroll contentContainerStyle={s.col}>
          <View style={s.cards} accessibilityRole="menu" onLayout={(e) => setBody(Math.round(e.nativeEvent.layout.height))}>
          <OperatorCard title={t("cpd.support.operator")} sub={t("cpd.support.operatorSub")} onPress={() => { setOpen(false); router.navigate("/support" as never); }} />
          {client ? <SupportItem kind="case" icon="alert-triangle" title={t("cpd.support.complaint")} sub={t("cpd.support.complaintSub")} onPress={() => { setOpen(false); setTimeout(() => setComplaint(true), 380); }} /> : null}
          <SupportItem kind="call" icon="phone" title={t("cpd.support.call")} sub={SUPPORT_PHONE} subBold onPress={() => { setOpen(false); openTel(SUPPORT_PHONE); }}>
            <BusinessHoursBadge inline />
          </SupportItem>
          <PressableScale onPress={() => go("/support")} accessibilityRole="menuitem" style={[s.hub, { borderColor: c.line }]}>
            <Text variant="small" weight="bold" tone="accent">{t("cpd.support.hub")}</Text>
            <Icon name="arrow-right" size={15} tone="accent" />
          </PressableScale>
          </View>
        </SheetScroll>
      </BottomSheet>
      {client ? <ComplaintSheet visible={complaint} onClose={() => setComplaint(false)} /> : null}
    </>
  );
}

const s = StyleSheet.create({
  col: { paddingHorizontal: 14, paddingTop: 14 },
  cards: { gap: 10 },
  hub: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13, borderRadius: 999, borderWidth: 1.5 },
});
