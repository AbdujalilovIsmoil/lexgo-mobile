import { Pill, type PillTone } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { MarketStage } from "../model/marketTypes";

export const STAGE_TONE: Record<MarketStage, PillTone> = { pending: "warn", active: "blue", completed: "ok", cancelled: "err" };

// "To'lov kutilmoqda / Faol / Yakunlangan / Bekor qilingan" as a coloured pill.
export function StageBadge({ stage }: { stage: MarketStage }) {
  const { t } = useT();
  return <Pill label={t(`mk4.stage.${stage}`)} tone={STAGE_TONE[stage]} small live={stage === "active"} />;
}
