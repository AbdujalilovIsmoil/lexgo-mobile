import { BottomSheet, SheetScroll } from "@/shared/ui";
import { useKept } from "@/shared/lib/useKept";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { useT } from "@/shared/i18n";
import { CoverageStat } from "./CoverageStat";
import { GuaranteeStat } from "./GuaranteeStat";
import { LawyersStat } from "./LawyersStat";
import { TemplatesStat } from "./TemplatesStat";

type Props = { statKey: string | null; onClose: () => void };

// The drawer behind a Home stat tile: each number explains itself with real data.
export function StatSheet({ statKey: current, onClose }: Props) {
  const { t } = useT();
  const key = useKept(current);
  const go = useSheetNavigate(onClose);
  return (
    <BottomSheet visible={!!current} onClose={onClose} title={key ? t(`stats.${key}.title`) : ""} subtitle={key ? t(`stats.${key}.sub`) : undefined}>
      <SheetScroll>
        {key === "lawyers" ? <LawyersStat go={go} /> : key === "templates" ? <TemplatesStat go={go} /> : key === "response" ? <GuaranteeStat go={go} /> : key === "coverage" ? <CoverageStat go={go} /> : null}
      </SheetScroll>
    </BottomSheet>
  );
}
