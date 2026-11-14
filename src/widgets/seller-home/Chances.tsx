import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Award, ChevronRight, CreditCard, LayoutGrid, Shield, type LucideIcon } from "lucide-react-native";
import { useProfileCompleteness, type SectionKey } from "@/entities/pro-profile";
import { usePayouts } from "@/entities/pro-workspace";
import { useSecurityProfile } from "@/entities/security";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { radius, useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { SectionHead } from "./SectionHead";

const PAID = new Set(["paid", "released", "completed", "done"]);

// The payout is weekly, on Thursdays: the date of the next one.
function nextThursday(from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7));
  return d;
}

type Row = { key: string; icon: LucideIcon; tint: string; title: string; sub: string; to: string | { pathname: string; params: Record<string, string> } };

// "Mening imkoniyatlarim": what is worth a minute today, each its own soft card — finishing the profile (how many parts are left; it opens
// the first missing one), the account's security (whether two-step sign-in is on) and the payout (what waits and when the next one is; it
// opens the payouts). A row whose data is not there yet is left out.
export function Chances() {
  const { t, locale } = useT();
  const c = useColors();
  const router = useRouter();
  const { sections, ready } = useProfileCompleteness();
  const sec = useSecurityProfile().data;
  const payouts = usePayouts().data;
  const missing = sections.filter((x) => !x.done);
  const first: SectionKey | undefined = missing[0]?.key;
  const rows: Row[] = [];
  if (ready && sections.length) rows.push(missing.length
    ? { key: "profile", icon: Award, tint: c.accent, title: t("shm.ws.topRank"), sub: t("shm.ws.sectionsLeft", { n: missing.length }), to: first ? { pathname: "/pro/profile", params: { section: first } } : "/pro/profile" }
    : { key: "profile", icon: Award, tint: c.ok, title: t("shm.ws.profileDone"), sub: t("shm.ws.profileDoneSub"), to: "/pro/profile" });
  if (sec) rows.push({ key: "security", icon: Shield, tint: sec.twoFactorEnabled ? c.ok : "#F59E0B", title: t("shm.ws.security"), sub: t(sec.twoFactorEnabled ? "shm.ws.twoFaOn" : "shm.ws.twoFaOff"), to: "/security" });
  if (payouts) {
    const pending = payouts.filter((p) => !PAID.has(p.status)).reduce((a, p) => a + p.amount, 0);
    rows.push({ key: "payout", icon: CreditCard, tint: "#F59E0B", title: t("shm.sd.payouts.title"), sub: `${fmtMoney(pending)} ${t("shm.sd.payouts.som")} · ${t("shm.sd.payouts.nextPayout", { date: fmtDate(nextThursday().toISOString(), locale) })}`, to: "/payments" });
  }
  if (!rows.length) return null;
  return (
    <View style={s.col}>
      <SectionHead icon={LayoutGrid} title={t("shm.home2.chances")} />
      {rows.map(({ key, icon: Glyph, tint, title, sub, to }) => (
        <PressableScale key={key} onPress={() => router.push(to as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${title}, ${sub}`} style={[s.row, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
          <View style={[s.ico, { backgroundColor: `${tint}1F` }]}><Glyph size={22} color={tint} strokeWidth={2} /></View>
          <View style={s.txt}>
            <Text variant="body" weight="bold" numberOfLines={2}>{title}</Text>
            <Text variant="small" tone="gray" numberOfLines={1}>{sub}</Text>
          </View>
          <ChevronRight size={20} color={c.gray} />
        </PressableScale>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderRadius: radius.rl, borderWidth: 1 },
  ico: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1, minWidth: 0, gap: 2 },
});
