import type { IconName } from "@/shared/ui";
import { Steps, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { OptionCard } from "./OptionCard";
import { OptionGrid } from "./OptionGrid";

export type PrepCard = { title: string; text: string; price: string; unit: string };
const ICONS: IconName[] = ["file-text", "edit-3", "alert-circle", "briefcase", "key", "layers"];

// Document types (contract, application, complaint, claim, power of attorney,
// corporate) as a grid, then how the drafting flow works.
export function PrepTypes({ onPick }: { onPick: (i: number) => void }) {
  const { t, tList } = useT();
  return (
    <>
      <OptionGrid>
        {tList<PrepCard>("modes.prep.cards").map((c, i) => <OptionCard key={i} icon={ICONS[i % ICONS.length]} title={c.title} text={c.text} price={c.price} unit={c.unit} onPress={() => onPick(i)} tone="#6A4DFF" />)}
      </OptionGrid>
      <Text variant="h4">{t("modes.ui.how")}</Text>
      <Steps steps={tList<{ title: string; text: string }>("modes.prep.flow")} />
      <Text variant="small" tone="gray">{t("modes.prep.info")}</Text>
    </>
  );
}
