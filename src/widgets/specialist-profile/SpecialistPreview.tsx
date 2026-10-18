import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { Lawyer } from "@/entities/lawyer";
import { ProfileTabs, type TabDef } from "@/widgets/client-profile";
import { GradientBox } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { AboutPanel } from "./AboutPanel";
import { ServicesPanel } from "./ServicesPanel";
import { SpecialistIdentity } from "./SpecialistIdentity";
import { SpecialistStats } from "./SpecialistStats";

type Tab = "services" | "about";
const TABS: TabDef<Tab>[] = [{ key: "services", icon: "briefcase", label: "spf.services" }, { key: "about", icon: "user", label: "spf.about" }];

// A specialist's page as clients see it (cover, identity, the six numbers, "Xizmatlar va narxlar" / "Haqida"), built from the very same
// parts as the real page but for a lawyer that is passed in, with no purchase, chat or reviews behind it. `selected` is the highlighted service.
export function SpecialistPreview({ lawyer, selected }: { lawyer: Lawyer; selected?: string }) {
  const c = useColors();
  const [tab, setTab] = useState<Tab>("services");
  return (
    <View style={[s.frame, { backgroundColor: c.bg, borderColor: c.line }]}>
      <GradientBox variant="dark" round={0} style={s.cover}><View /></GradientBox>
      <SpecialistIdentity lawyer={lawyer} />
      <SpecialistStats lawyer={lawyer} />
      <View style={s.body}>
        <ProfileTabs value={tab} onChange={setTab} tabs={TABS} />
        {tab === "services" ? <ServicesPanel services={lawyer.services} selected={selected ?? ""} blocked="" onSelect={() => undefined} onExplain={() => undefined} /> : <AboutPanel lawyer={lawyer} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  frame: { borderRadius: 28, borderWidth: 1, overflow: "hidden", paddingBottom: 16 },
  cover: { height: 96, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  body: { paddingHorizontal: 12, marginTop: 16, gap: 14 },
});
