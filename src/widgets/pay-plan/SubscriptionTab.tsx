import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, ChartColumn, Check, ChevronRight, CircleCheck, CreditCard, Crown, Database, FileText, Gem, Layers, ListChecks, Smartphone, Sparkles, Star, TriangleAlert, type LucideIcon } from "lucide-react-native";
import { FeatureRow, forViewer, isGiftPlan, orderPlans, useContract, useEntitlements, useFeatureLabel, useMyFeatures, usePlanQuote, usePlans, viewerOf, type BillingPeriod, type Plan, type PlanFeature } from "@/entities/plan";
import { useClientProfile } from "@/entities/profile-extras";
import { useSession } from "@/entities/session";
import { useChoosePlan } from "@/features/choose-plan";
import { TelegramRequestSheet } from "@/widgets/subscription";
import { brand, useTheme } from "@/shared/theme";
import { PressableScale, Skeleton, Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { DIGITAL_SALES } from "@/shared/store-rules";
import { useT } from "@/shared/i18n";
import { HelpCard, IconTile, Panel, SectionTitle } from "./parts";

const LOOKS: { icon: LucideIcon; color: string }[] = [
  { icon: Crown, color: "#2F7BFF" },
  { icon: Gem, color: "#8B5CF6" },
  { icon: Star, color: "#16A34A" },
  { icon: Sparkles, color: "#F59E0B" },
];

const featureIcon = (key: string): { icon: LucideIcon; color: string } =>
  /ai|chat|assist/i.test(key) ? { icon: Sparkles, color: "#8B5CF6" } : /doc|analys|file|template/i.test(key) ? { icon: FileText, color: brand.b600 } : /hist|archive|stor|day/i.test(key) ? { icon: Database, color: brand.b600 } : { icon: ChartColumn, color: brand.b600 };

// A counter the backend keeps for this period (used / limit) — the rows with a progress bar.
const isCounter = (f: PlanFeature) => f.mode === "limited" && f.limit !== null && f.used !== null;

// The plan's price for one period as the backend quotes it (the same quote the tariffs page shows).
function periodOf(plan: Plan): BillingPeriod {
  const allowed = plan.allowedBillingPeriods;
  return !allowed.length || allowed.includes("monthly") ? "monthly" : (allowed[0] as BillingPeriod);
}

function OfferPrice({ plan, period }: { plan: Plan; period: BillingPeriod }) {
  const { t } = useT();
  const free = plan.monthlyPrice <= 0;
  const q = usePlanQuote(plan.id, period, !free);
  if (free) return <Text variant="h3" style={s.price}>{t("cs.free")}</Text>;
  if (q.isPending) return <Skeleton width={90} height={26} round={8} />;
  const amount = q.data?.amount ?? plan.monthlyPrice;
  return (
    <View style={s.priceCol}>
      <Text variant="h3" style={s.price}>{fmtMoney(amount)}</Text>
      <Text variant="caption" tone="gray">{t(`subq.price.${period}`)}</Text>
    </View>
  );
}

function OfferCard({ plan, order, current, onChoose }: { plan: Plan; order: number; current: boolean; onChoose: () => void }) {
  const { colors: c, dark } = useTheme();
  const { t } = useT();
  const look = LOOKS[order % LOOKS.length];
  const lines = plan.features.length ? plan.features.slice(0, 3) : plan.description ? [plan.description] : [];
  return (
    <Panel style={[s.offer, current ? { borderColor: dark ? `${brand.b500}88` : `${brand.b500}66`, borderWidth: 1.5 } : {}]}>
      <View style={s.offerTop}>
        <IconTile icon={look.icon} color={look.color} size={52} />
        <View style={s.flex}>
          <Text variant="h4" numberOfLines={1} style={s.planName}>{plan.name}</Text>
          {plan.description && plan.features.length ? <Text variant="caption" tone="gray" numberOfLines={2}>{plan.description}</Text> : null}
        </View>
        <OfferPrice plan={plan} period={periodOf(plan)} />
      </View>
      <View style={s.offerBottom}>
        <View style={[s.flex, s.lines]}>
          {lines.map((l) => (
            <View key={l} style={s.line}>
              <Check size={16} color={c.ok} strokeWidth={2.6} />
              <Text variant="caption" style={s.flex} numberOfLines={2}>{l}</Text>
            </View>
          ))}
        </View>
        {current ? (
          <View style={[s.btn, { backgroundColor: brand.b600, borderColor: brand.b600 }]}><Text variant="small" weight="semibold" style={s.btnOn}>{t("pps.current")}</Text></View>
        ) : (
          <PressableScale onPress={onChoose} scale={0.96} accessibilityRole="button" accessibilityLabel={`${t("pps.subscribe")}: ${plan.name}`} style={[s.btn, { borderColor: dark ? c.accent : brand.b500 }]}>
            <Text variant="small" weight="semibold" style={{ color: dark ? c.accent : brand.b600 }}>{t("pps.subscribe")}</Text>
          </PressableScale>
        )}
      </View>
    </Panel>
  );
}

function Fact({ icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <View style={s.fact}>
      <IconTile icon={icon} color={brand.b500} size={40} />
      <View style={s.flex}>
        <Text variant="caption" tone="gray" numberOfLines={1}>{label}</Text>
        <Text variant="h4" numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

function CounterRow({ f, label }: { f: PlanFeature; label: string }) {
  const { colors: c } = useTheme();
  const look = featureIcon(f.key);
  const Glyph = look.icon;
  const share = f.limit ? Math.max(0, Math.min(1, (f.used ?? 0) / f.limit)) : 0;
  return (
    <View style={s.counter}>
      <Glyph size={22} color={look.color} strokeWidth={1.8} />
      <View style={[s.flex, s.counterBody]}>
        <View style={s.counterHead}>
          <Text variant="small" weight="medium" style={s.flex} numberOfLines={1}>{label}</Text>
          <Text variant="small"><Text variant="small" weight="bold">{f.used ?? 0}</Text> / {f.limit ?? 0}</Text>
        </View>
        <View style={[s.track, { backgroundColor: c.surface2 }]}>
          <View style={[s.fill, { width: `${share * 100}%`, backgroundColor: share >= 1 ? c.err : brand.b500 }]} />
        </View>
      </View>
    </View>
  );
}

function CurrentPlan() {
  const { colors: c, dark } = useTheme();
  const { t, locale } = useT();
  const router = useRouter();
  const f = useMyFeatures().data;
  const ent = useEntitlements().data;
  const plans = usePlans().data;
  const profile = useClientProfile().data;
  const contract = useContract(f?.subscriptionId ?? "").data;
  const label = useFeatureLabel();
  const loading = !f && !ent && !profile;
  if (loading) return <Skeleton height={260} round={22} />;
  const planId = contract?.planId || f?.planId || ent?.subs[0]?.planId || "";
  const plan = planId ? plans?.find((p) => p.id === planId) : undefined;
  const name = (contract && (contract.names[locale] || contract.names.uz || contract.title)) || plan?.name || profile?.planName || t("cdash.side.freePlan");
  const subscribed = !!(f?.subscriptionId || ent?.subs.length || profile?.planName);
  const active = !!(ent?.active || f?.active || profile?.planStatus === "active");
  const ends = ent?.endsAt || ent?.subs.find((x) => x.planId === planId)?.endsAt || "";
  const items = f?.items ?? [];
  const usable = items.filter((i) => i.mode !== "unavailable" && i.allowed).length;
  const counters = items.filter(isCounter).slice(0, 4);
  const consent = !!f && (f.consentRequired || !!contract?.consentRequired || !!contract?.termsChanged) && contract?.consentAccepted !== true;
  return (
    <Panel style={s.mine}>
      <View style={s.mineHead}>
        <IconTile icon={Crown} color={brand.b500} size={56} />
        <View style={s.flex}>
          <Text variant="h3" numberOfLines={1}>{name}</Text>
          <Text variant="small" tone="gray">{t("pps.current")}</Text>
        </View>
        {subscribed ? (
          <View style={[s.status, { backgroundColor: active ? c.okBg : c.surface2 }]}>
            <CircleCheck size={15} color={active ? c.ok : c.gray} strokeWidth={2.4} />
            <Text variant="small" weight="semibold" style={{ color: active ? c.ok : c.gray }}>{t(active ? "pps.active" : "pps.inactive")}</Text>
          </View>
        ) : null}
      </View>
      {subscribed ? (
        <View style={[s.facts, { borderColor: c.line }]}>
          <Fact icon={Calendar} label={t("pps.until")} value={ends ? fmtDate(ends, locale) : t("pps.noEnd")} />
          <View style={[s.sep, { backgroundColor: c.line }]} />
          <Fact icon={Layers} label={t("pps.left")} value={items.length ? `${usable} / ${items.length}` : "—"} />
        </View>
      ) : <Text variant="small" tone="gray">{t(DIGITAL_SALES ? "pps.noPlanText" : "pps.freeText")}</Text>}
      {!DIGITAL_SALES && subscribed ? (
        <View style={s.synced}>
          <Smartphone size={16} color={c.gray} />
          <Text variant="caption" tone="gray" style={s.flex}>{t("pps.synced")}</Text>
        </View>
      ) : null}
      {consent && DIGITAL_SALES ? (
        <PressableScale onPress={() => router.push("/subscription")} scale={0.98} accessibilityRole="button" style={[s.consent, { backgroundColor: c.warnBg }]}>
          <TriangleAlert size={18} color={c.warn} />
          <Text variant="small" weight="semibold" style={[s.flex, { color: c.warn }]}>{t("pps.consent")}</Text>
          <ChevronRight size={18} color={c.warn} />
        </PressableScale>
      ) : null}
      {counters.length ? <View style={s.counters}>{counters.map((i) => <CounterRow key={i.key} f={i} label={label(i.key)} />)}</View> : null}
      {items.length && DIGITAL_SALES ? (
        <PressableScale onPress={() => router.push("/entitlements")} scale={0.98} accessibilityRole="button" style={[s.more, { backgroundColor: dark ? c.surface2 : c.tint }]}>
          <Text variant="body" weight="semibold" style={s.moreText}>{t("pps.limits")}</Text>
          <ChevronRight size={20} color={c.accent} />
        </PressableScale>
      ) : null}
    </Panel>
  );
}

// Every feature of the current plan as the backend reports it: what is included, how much is used and left, when it resets, what is not
// included. Only the person's own plan — no other tariffs, prices or ways to change the plan (shown where the app does not sell plans).
function PlanLimits() {
  const { t } = useT();
  const items = useMyFeatures().data?.items ?? [];
  const label = useFeatureLabel();
  if (!items.length) return null;
  const order = (m: string) => (m === "limited" ? 0 : m === "unlimited" ? 1 : 2);
  const sorted = [...items].sort((a, b) => order(a.mode) - order(b.mode));
  return (
    <>
      <SectionTitle icon={ListChecks} title={t("pps.limitsTitle")} />
      <Text variant="small" tone="gray">{t("pps.limitsText")}</Text>
      <Panel style={s.limits}>{sorted.map((f, i) => <FeatureRow key={f.key} f={f} label={label(f.key)} first={i === 0} />)}</Panel>
    </>
  );
}

function LinkRow({ icon, title, sub, onPress }: { icon: LucideIcon; title: string; sub?: string; onPress: () => void }) {
  const { colors: c } = useTheme();
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button">
      <Panel style={s.link}>
        <IconTile icon={icon} color={brand.b500} size={42} />
        <View style={s.flex}>
          <Text variant="body" weight="semibold">{title}</Text>
          {sub ? <Text variant="caption" tone="gray">{sub}</Text> : null}
        </View>
        <ChevronRight size={20} color={c.gray} />
      </Panel>
    </PressableScale>
  );
}

// "Obuna": the current plan with its counters, then every plan this person can buy (the current one marked), the way to the full tariffs
// page and the saved cards, and the support note. Where the app may not sell plans (iOS, App Store 3.1.1) it only shows the plan the
// person already has and all of its limits: no prices, other packages, "subscribe" buttons, cards or hints at buying elsewhere.
export function SubscriptionTab() {
  const { t } = useT();
  const router = useRouter();
  const plans = usePlans();
  const ent = useEntitlements().data;
  const cur = useClientProfile().data?.planName;
  const ch = useChoosePlan();
  const viewer = viewerOf(useSession()?.user.role);
  const sellable = orderPlans((plans.data ?? []).filter((p) => !isGiftPlan(p) && forViewer(p, viewer)), () => true);
  const owned = new Set(ent?.planIds ?? []);
  const isCurrent = (p: Plan) => owned.has(p.id) || (!!cur && p.name === cur);
  return (
    <View style={s.gap}>
      <SectionTitle icon={Crown} title={t("pps.myPlan")} />
      <CurrentPlan />
      {DIGITAL_SALES ? null : <PlanLimits />}
      {DIGITAL_SALES ? <>
      <SectionTitle icon={Layers} title={t("pps.other")} />
      {plans.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} height={150} round={22} />) : sellable.map((p, i) => (
        <OfferCard key={p.id} plan={p} order={i} current={isCurrent(p)} onChoose={() => ch.choose(p, periodOf(p))} />
      ))}
      <LinkRow icon={Star} title={t("pps.allPlans")} onPress={() => router.push("/subscription")} />
      <LinkRow icon={CreditCard} title={t("pps.cards")} sub={t("pps.cardsSub")} onPress={() => router.push("/profile/methods")} />
      </> : null}
      <HelpCard text={t("pps.planHelp")} />
      {DIGITAL_SALES ? <TelegramRequestSheet plan={ch.picked} period={ch.period} onClose={ch.closePicked} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  gap: { gap: 14 },
  flex: { flex: 1 },
  mine: { gap: 16 },
  mineHead: { flexDirection: "row", alignItems: "center", gap: 14 },
  status: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  facts: { flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 14 },
  fact: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  sep: { width: 1, alignSelf: "stretch" },
  consent: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14 },
  counters: { gap: 16 },
  counter: { flexDirection: "row", alignItems: "center", gap: 14 },
  counterBody: { gap: 8 },
  counterHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: { height: 7, borderRadius: 4, overflow: "hidden" },
  fill: { height: 7, borderRadius: 4 },
  more: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 16, paddingHorizontal: 16 },
  moreText: { flex: 1, textAlign: "center", marginLeft: 20 },
  offer: { gap: 12 },
  offerTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  planName: { fontSize: 18, lineHeight: 23 },
  priceCol: { alignItems: "flex-end" },
  price: { fontSize: 22, lineHeight: 26 },
  offerBottom: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingLeft: 64 },
  lines: { gap: 6 },
  line: { flexDirection: "row", alignItems: "center", gap: 8 },
  btn: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  btnOn: { color: "#FFFFFF" },
  synced: { flexDirection: "row", alignItems: "center", gap: 8 },
  limits: { gap: 10 },
  link: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
});
