import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { useIsAuthed } from "@/entities/session";
import { canChatWith, useMarketOrders } from "@/entities/order";
import { useLawyerServices, usePromoActive, type Lawyer, type LawyerService } from "@/entities/lawyer";
import { ChatFeeSheet, useSpecialistChat } from "@/features/specialist-chat";
import { PurchaseFlow } from "@/features/market-purchase";
import { ProfileTabs, type TabDef } from "@/widgets/client-profile";
import { PriceExplainer, useBuyGate } from "@/widgets/lawyer-sheet";
import { ProfileCover } from "@/widgets/profile";
import { AboutPanel, BuyBar, ServicesPanel, SpecialistIdentity, SpecialistStats } from "@/widgets/specialist-profile";
import { BottomSheet, Header, HeroScroll, Reveal, SheetScroll, toast } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { ReviewsPanel } from "./ReviewsPanel";

export type SpecialistTab = "services" | "about" | "reviews";
const TABS: TabDef<SpecialistTab>[] = [
  { key: "services", icon: "briefcase", label: "mkd.services" },
  { key: "about", icon: "user", label: "mkd.about" },
  { key: "reviews", icon: "star", label: "mkd.tabReviews" },
];
const TAB_LABEL: TabDef<SpecialistTab>[] = [{ ...TABS[0], label: "spf.services" }, { ...TABS[1], label: "spf.about" }, TABS[2]];

// A specialist's page as the web shows it, in the client profile's build: cover and identity, the six numbers, three
// gliding tabs (services and prices · about · reviews), a bar with the picked service's price and "Sotib olish" — which opens
// the purchase flow in a sheet — plus the chat button (with its one-time fee sheet) and the price explainer.
export function SpecialistView({ lawyer: l, initialTab }: { lawyer: Lawyer; initialTab: SpecialistTab }) {
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const authed = useIsAuthed();
  const blocked = useBuyGate(l);
  const chat = useSpecialistChat(l.userId);
  const canChat = canChatWith(l.userId, useMarketOrders(authed).data);
  const top = (usePromoActive().data ?? []).some((p) => p.sellerUserId === l.userId);
  const services = useLawyerServices(l.userId).data ?? l.services;
  const [nav, setNav] = useState<{ tab: SpecialistTab; dir: 1 | -1 }>({ tab: initialTab, dir: 1 });
  const [picked, setPicked] = useState("");
  const [buy, setBuy] = useState<LawyerService | null>(null);
  const [explain, setExplain] = useState(false);
  const sel = services.find((x) => x.id === picked) ?? services.find((x) => x.price > 0) ?? services[0] ?? null;
  const go = (next: SpecialistTab) => setNav({ tab: next, dir: TABS.findIndex((x) => x.key === next) >= TABS.findIndex((x) => x.key === nav.tab) ? 1 : -1 });
  // The bar's one button is never dead: closed purchase → the reason, nothing on sale → the catalogue narrowed to this specialist.
  const start = (sv: LawyerService | null) => {
    if (!authed) return router.push("/auth/login");
    if (blocked) return toast(blocked, "info");
    if (!sv?.price) return router.push({ pathname: "/services", params: { lawyer: l.userId, name: l.name } });
    setBuy(sv);
  };
  const leave = (fn: () => void) => { setBuy(null); setTimeout(fn, 380); };
  return (
    <View style={[s.fill, { backgroundColor: c.bg }]}>
      <HeroScroll contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View>
          <ProfileCover />
          <View style={s.back} pointerEvents="box-none"><Header transparent light /></View>
        </View>
        <SpecialistIdentity lawyer={l} top={top} />
        <SpecialistStats lawyer={l} />
        <View style={s.body}>
          <Reveal i={2}><ProfileTabs value={nav.tab} onChange={go} tabs={TAB_LABEL} /></Reveal>
          <Animated.View key={nav.tab} entering={(nav.dir === 1 ? FadeInRight : FadeInLeft).duration(320)}>
            {nav.tab === "services" ? <ServicesPanel services={services} selected={sel?.id ?? ""} blocked={blocked} onSelect={setPicked} onExplain={() => setExplain(true)} /> : null}
            {nav.tab === "about" ? <AboutPanel lawyer={l} /> : null}
            {nav.tab === "reviews" ? <ReviewsPanel lawyer={l} /> : null}
          </Animated.View>
        </View>
      </HeroScroll>
      <BuyBar service={sel} fallback={l.basePrice} canChat={canChat} chatBusy={chat.opening} onChat={chat.start} onBuy={() => start(sel)} />
      <ChatFeeSheet visible={chat.fee} lawyerId={l.userId} opening={chat.opening} onClose={chat.closeFee} onPaid={chat.open} />
      <BottomSheet visible={!!buy} onClose={() => setBuy(null)} snaps={[0.72, 0.93]}>
        {buy ? <PurchaseFlow lawyerId={l.userId} lawyerName={l.name} service={buy} blocked={blocked} onBack={() => setBuy(null)} onOrders={() => leave(() => router.navigate("/(tabs)/orders"))} onChat={(room) => leave(() => router.push({ pathname: "/chat/[roomId]", params: { roomId: room } }))} onLogin={() => leave(() => router.push("/auth/login"))} onClose={() => setBuy(null)} /> : null}
      </BottomSheet>
      <BottomSheet visible={explain} onClose={() => setExplain(false)}>
        <SheetScroll><PriceExplainer service={sel} onBack={() => setExplain(false)} /></SheetScroll>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 }, back: { position: "absolute", top: 0, left: 0, right: 0 }, body: { paddingHorizontal: 16, marginTop: 20, gap: 14 } });
