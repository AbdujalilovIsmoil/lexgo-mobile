import { useState } from "react";
import { useAccess } from "@/entities/access";
import { Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ProFeed } from "./pro";
import { ProPool } from "./ProPool";

// /pro/urgent: my cases, plus — for a call-center lawyer only — the open pool to take work from (TZ 3.4).
export function ProUrgent() {
  const { t } = useT();
  const { callCenterLawyer } = useAccess();
  const [tab, setTab] = useState<"mine" | "pool">("mine");
  const switcher = callCenterLawyer ? <Segmented value={tab} onChange={setTab} options={[{ value: "mine", label: t("ug5.tabMine") }, { value: "pool", label: t("ug5.tabPool") }]} /> : undefined;
  return tab === "pool" && callCenterLawyer ? <ProPool header={switcher} /> : <ProFeed header={switcher} />;
}
