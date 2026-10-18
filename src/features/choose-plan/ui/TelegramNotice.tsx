import type { TelegramProblem } from "../model/useTelegramRequest";
import { Notice } from "@/shared/ui/sel/Notice";
import { useT } from "@/shared/i18n";

// Why a Telegram request did not go through (422 narrowed the periods / not delivered / other error).
// `gate` picks the wording of the manual-document gate instead of the plan sheet.
export function TelegramNotice({ problem, detail, gate }: { problem: TelegramProblem | null; detail: string; gate?: boolean }) {
  const { t } = useT();
  if (!problem) return null;
  const pre = gate ? "md" : "tg";
  const text = problem === "refused" ? t(`tgp.${pre}Refused`) : problem === "undelivered" ? t("tgp.tgNotDelivered") : (!gate && detail) || t(`tgp.${pre}Error`);
  return <Notice tone="err" text={text} />;
}
