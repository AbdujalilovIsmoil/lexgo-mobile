import { useState } from "react";
import { View } from "react-native";
import { useLive, type OrgNode, type Position, type Unit } from "@/entities/admin-hrm";
import { PositionForm, UnitForm } from "@/features/admin-hrm";
import { UnitSheet } from "@/widgets/admin-hrm";
import { AdminPage } from "@/shared/ui/admin";
import { IconButton, Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { OrgBoardTab } from "./OrgBoardTab";
import { OrgChartTab } from "./OrgChartTab";
import { OrgPositionsTab } from "./OrgPositionsTab";
import { OrgStatsTab } from "./OrgStatsTab";

type Tab = "chart" | "board" | "positions" | "stats";
const later = (fn: () => void) => setTimeout(fn, 320);

// Organization (internal_org.manage): the unit tree with people, job positions and statistics; units and positions are created / edited here.
export default function OrgPage() {
  const { t } = useT();
  useLive();
  const [tab, setTab] = useState<Tab>("chart");
  const [node, setNode] = useState<OrgNode | null>(null);
  const [unit, setUnit] = useState<{ base: Unit | null; parent: string }>({ base: null, parent: "" });
  const [pos, setPos] = useState<Position | null>(null);
  const [unitOpen, setUnitOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [rev, setRev] = useState(0);
  const openUnit = (base: Unit | null, parent = "") => { setNode(null); later(() => { setUnit({ base, parent }); setRev((n) => n + 1); setUnitOpen(true); }); };
  const openPos = (p: Position | null) => { setPos(p); setRev((n) => n + 1); setPosOpen(true); };
  const tabs = (["chart", "board", "positions", "stats"] as const).map((k) => ({ value: k, label: k === "chart" || k === "board" ? t(`ag8.org.${k}`) : t(`admHrmB.tab.${k}`) }));
  const add = tab === "board" || tab === "chart" ? () => openUnit(null) : tab === "positions" ? () => openPos(null) : undefined;
  return (
    <AdminPage title={t("admHrm.nav.org")} subtitle={t("admHrmB.navDesc.org")} right={add ? <IconButton icon="plus" onPress={add} /> : undefined}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Segmented options={tabs} value={tab} onChange={setTab} /></View>
      {tab === "chart" ? <OrgChartTab onUnit={setNode} /> : null}
      {tab === "board" ? <OrgBoardTab onUnit={setNode} /> : null}
      {tab === "positions" ? <OrgPositionsTab onOpen={openPos} /> : null}
      {tab === "stats" ? <OrgStatsTab /> : null}
      <UnitSheet node={node} canManage onClose={() => setNode(null)} onEdit={(u) => openUnit(u)} onAddChild={(id) => openUnit(null, id)} />
      <UnitForm key={`u-${rev}`} visible={unitOpen} onClose={() => setUnitOpen(false)} unit={unit.base} parentId={unit.parent} />
      <PositionForm key={`p-${rev}`} visible={posOpen} onClose={() => setPosOpen(false)} position={pos} />
    </AdminPage>
  );
}
