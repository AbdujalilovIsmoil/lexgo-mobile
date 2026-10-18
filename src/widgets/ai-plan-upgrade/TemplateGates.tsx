import { ManualDocPlanSheet } from "@/features/manual-doc-plan";
import { AiPlanUpgradeSheet } from "./AiPlanUpgradeSheet";

type Gates = { planMsg: string | null; closePlan: () => void; upgrade: boolean; setUpgrade: (v: boolean) => void };

// The two stops a template download can hit: no manual-documents entitlement (402, the server's own
// words + the plans page) and the free LexGo.AI tier (pick Lite/Pro in place).
export function TemplateGates({ gates }: { gates: Gates }) {
  return (
    <>
      <ManualDocPlanSheet message={gates.planMsg} onClose={gates.closePlan} />
      <AiPlanUpgradeSheet visible={gates.upgrade} onClose={() => gates.setUpgrade(false)} />
    </>
  );
}
