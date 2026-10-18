import { View } from "react-native";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const key = (iso: string): string => iso.slice(0, 7);

// "Oktabr 2026" above the first payment of a month (the list is newest first, so a change of month = a new heading).
export function MonthHead({ at, prev }: { at: string; prev?: string }) {
  const { t } = useT();
  if (!at || (prev && key(prev) === key(at))) return null;
  const [y, m] = key(at).split("-");
  return <View style={{ paddingTop: prev ? 18 : 4, paddingBottom: 2 }}><Text variant="small" weight="bold" tone="gray">{t(`pyx.mon.${Number(m)}`)} {y}</Text></View>;
}
