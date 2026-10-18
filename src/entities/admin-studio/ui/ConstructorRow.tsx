import { Pill } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { ctorMeta } from "../model/ctorMeta";
import { groupMeta } from "../model/groupMeta";
import { useStudioText } from "../model/useStudioText";
import type { StudioConstructor } from "../model/types";
import { DepChips } from "./DepChips";

type Props = { item: StudioConstructor; count: number | null; onPress: () => void };

// One constructor in the catalogue: group-tinted icon, name, short description, step / dependency chips, active object count.
export function ConstructorRow({ item, count, onPress }: Props) {
  const { t, ctorName } = useStudioText();
  const g = groupMeta(item.nav?.group ?? "");
  const known = ctorMeta(item.code).key;
  return (
    <CcTicket
      tint={g.color}
      icon={known ? ctorMeta(item.code).icon : g.icon}
      title={ctorName(item.code, item.title)}
      subtitle={item.description || undefined}
      badge={count ? <Pill label={String(count)} tone="blue" small /> : undefined}
      chips={<><Pill label={item.code} tone="gray" small />{!item.approvalRequired ? <Pill label={t("admStudio.dash.free")} tone="ok" icon="zap" small /> : null}<DepChips nav={item.nav} /></>}
      onPress={onPress}
    />
  );
}
