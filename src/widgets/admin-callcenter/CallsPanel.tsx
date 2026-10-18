import { useState } from "react";
import { View } from "react-native";
import { soft, useCalls, type CcCall } from "@/entities/admin-callcenter";
import { LogCallSheet } from "@/features/admin-callcenter";
import { PagedList } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Bleed } from "./Bleed";
import { CallTicket } from "./kit/CallTicket";

type Dir = "" | "incoming" | "outgoing" | "missed";
const DIRS: Dir[] = ["", "incoming", "outgoing", "missed"];
const match = (c: CcCall, d: Dir) => (d === "missed" ? c.status === "missed" : !d || c.direction === d);

// The call log (last 50 calls, filterable by direction) with the manual "log a call" form.
export function CallsPanel() {
  const { t } = useT();
  const q = useCalls();
  const [dir, setDir] = useState<Dir>("");
  const [form, setForm] = useState(false);
  const all = q.data ?? [];
  const options = DIRS.map((d) => ({ value: d, label: d ? t(`admCcC.dir3.${d}`) : t("adm.all"), count: all.filter((c) => match(c, d)).length }));
  const header = (
    <View style={{ gap: 10, paddingBottom: 12 }}>
      <Bleed><CcTiles options={options.map((o) => ({ ...o, alert: o.value === "missed" }))} value={dir} onChange={(v) => setDir(v as Dir)} /></Bleed>
      <Button title={t("admCcC.logCall")} icon="plus" size="sm" variant="gradient" onPress={() => setForm(true)} />
    </View>
  );
  return (
    <>
      <PagedList data={all.filter((c) => match(c, dir)).slice(0, 50)} query={soft(q)} keyExtractor={(c) => c.id} renderItem={(c) => <CallTicket call={c} />} header={header} empty={{ icon: "phone-off", title: t("admCcC.noCalls") }} />
      <LogCallSheet visible={form} onClose={() => setForm(false)} />
    </>
  );
}
