import { Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { Lawyer, LawyerService } from "@/entities/lawyer";
import { AboutTab } from "./AboutTab";
import { InfoTab } from "./InfoTab";
import { ResultsTab } from "./ResultsTab";
import { ServicesTab } from "./ServicesTab";

export type LawyerTab = "about" | "services" | "results" | "info";
type Props = { lawyer: Lawyer; tab: LawyerTab; onTab: (t: LawyerTab) => void; blocked: string; authed: boolean; onBuy: (s: LawyerService) => void; onExplain: () => void };

// The four sections of a profile: about, services (where the purchase starts), results + reviews, facts.
export function LawyerTabs({ lawyer, tab, onTab, blocked, authed, onBuy, onExplain }: Props) {
  const { t } = useT();
  const options = (["about", "services", "results", "info"] as const).map((k) => ({ value: k, label: t(`lw.tabs.${k}`) }));
  return (
    <>
      <Segmented value={tab} onChange={onTab} options={options} />
      {tab === "about" ? <AboutTab lawyer={lawyer} /> : tab === "services" ? <ServicesTab lawyer={lawyer} blocked={blocked} authed={authed} onBuy={onBuy} onExplain={onExplain} /> : tab === "results" ? <ResultsTab lawyer={lawyer} /> : <InfoTab lawyer={lawyer} />}
    </>
  );
}
