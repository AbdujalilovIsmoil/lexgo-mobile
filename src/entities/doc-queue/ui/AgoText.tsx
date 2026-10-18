import { Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { agoOf } from "../lib/listLogic";

// "2 soat oldin" for a date; amber and followed by «kechikmoqda» when the request is late.
export function AgoText({ iso, late }: { iso: string; late?: boolean }) {
  const { t } = useT();
  const c = useColors();
  const a = agoOf(iso);
  if (!a) return null;
  const word = a.unit === "now" ? t("admSt.ago.now") : t(`admSt.ago.${a.unit}`, { n: a.n });
  return <Text variant="caption" weight={late ? "semibold" : "regular"} tone={late ? "warn" : "gray"} style={late ? { color: c.warn } : undefined}>{late ? `${word} · ${t("proDocSheet.lateShort").toLowerCase()}` : word}</Text>;
}
