import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import type { Lawyer, LawyerService } from "@/entities/lawyer";
import { PurchaseFlow } from "@/features/market-purchase";
import { SheetScroll } from "@/shared/ui";
import { LawyerActions } from "./LawyerActions";
import { LawyerFacts } from "./LawyerFacts";
import { LawyerHeader } from "./LawyerHeader";
import { LawyerTabs, type LawyerTab } from "./LawyerTabs";
import { PriceExplainer } from "./PriceExplainer";
import { useBuyGate } from "./useBuyGate";

type Step = "main" | "explain" | "buy";

// Header, quick facts and four sections. "Buy" on a service opens the purchase
// flow inside the same drawer; "How is the price set?" opens the rules.
export function LawyerSheetBody({ lawyer, onLeave, initialTab = "about" }: { lawyer: Lawyer; onLeave: (fn: () => void) => void; initialTab?: LawyerTab }) {
  const router = useRouter();
  const authed = useIsAuthed();
  const blocked = useBuyGate(lawyer);
  const [tab, setTab] = useState<LawyerTab>(initialTab);
  const [view, setView] = useState<Step>("main");
  const [service, setService] = useState<LawyerService | null>(null);
  const login = () => onLeave(() => router.push("/auth/login"));
  const buy = (sv: LawyerService) => {
    if (!authed) return login();
    setService(sv);
    setView("buy");
  };
  if (view === "explain") return <SheetScroll><PriceExplainer service={service ?? lawyer.services[0] ?? null} onBack={() => setView("main")} /></SheetScroll>;
  if (view === "buy" && service) {
    const chat = (room: string) => onLeave(() => router.push({ pathname: "/chat/[roomId]", params: { roomId: room } }));
    return <SheetScroll><PurchaseFlow lawyerId={lawyer.userId} lawyerName={lawyer.name} service={service} blocked={blocked} onBack={() => setView("main")} onOrders={() => onLeave(() => router.navigate("/(tabs)/orders"))} onChat={chat} onLogin={login} onClose={() => setView("main")} /></SheetScroll>;
  }
  return (
    <View style={{ flex: 1 }}>
      <SheetScroll>
        <LawyerHeader lawyer={lawyer} />
        <LawyerFacts lawyer={lawyer} />
        <LawyerTabs lawyer={lawyer} tab={tab} onTab={setTab} blocked={blocked} authed={authed} onBuy={buy} onExplain={() => setView("explain")} />
      </SheetScroll>
      {tab === "services" ? null : <LawyerActions lawyer={lawyer} onChoose={() => setTab("services")} />}
    </View>
  );
}
