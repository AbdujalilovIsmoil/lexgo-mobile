import { StyleSheet, View } from "react-native";
import { CircleCheck, CircleX, Clock } from "lucide-react-native";
import { VerificationButton } from "@/features/pro-profile-edit";
import { Text } from "@/shared/ui";
import { ProfileGroup } from "@/shared/ui/profile";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { verified: boolean; status: string; badge: string };

// Verification badge state and the "ask for a check" action (clients only see verified sellers), as one card of the client profile's look.
export function VerificationCard({ verified, status, badge }: Props) {
  const { t } = useT();
  const c = useColors();
  const key = verified ? "approved" : /^(rejected|declined)$/.test(status) ? "rejected" : "pending";
  const Glyph = verified ? CircleCheck : key === "rejected" ? CircleX : Clock;
  const [bg, fg] = verified ? [c.okBg, c.ok] : key === "rejected" ? [c.errBg, c.err] : [c.warnBg, c.warn];
  return (
    <ProfileGroup title={t("sl4.verification")} padded>
      <View style={s.row}>
        <View style={[s.ico, { backgroundColor: bg }]}><Glyph size={20} color={fg} /></View>
        <View style={s.col}>
          <Text variant="h4" weight="semibold" style={s.title}>{badge || t(`sl4.vstate.${key}`)}</Text>
          <Text variant="caption" tone="gray">{t(`sl4.vtext.${key}`)}</Text>
        </View>
      </View>
      {verified ? null : <VerificationButton />}
    </ProfileGroup>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  ico: { width: 40, height: 40, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
  title: { fontSize: 15, lineHeight: 20 },
});
