import type { IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { OptionCard } from "./OptionCard";
import { OptionGrid } from "./OptionGrid";

export type ConsultCard = { title: string; text: string; price: string; unit: string };
const ICONS: IconName[] = ["clock", "video", "message-circle", "copy"];

// The four consultation formats (Express / Video / Chat / Second opinion).
export function ConsultOptions({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  const { tList } = useT();
  return (
    <OptionGrid>
      {tList<ConsultCard>("modes.consult.cards").map((c, i) => (
        <OptionCard key={i} icon={ICONS[i % ICONS.length]} title={c.title} text={c.text} price={c.price} unit={c.unit} selected={i === value} onPress={() => onChange(i)} />
      ))}
    </OptionGrid>
  );
}
