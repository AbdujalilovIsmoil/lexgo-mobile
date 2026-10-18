import { integrationTone, type Integration } from "@/entities/admin-integrations";
import { CcHero } from "@/shared/ui/cc";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Health at a glance: total, how many are connected, waiting, broken or off, with one stacked bar.
export function IntegrationHero({ items }: { items: Integration[] }) {
  const { t } = useT();
  const c = useColors();
  const n = (tone: string) => items.filter((i) => integrationTone(i) === tone).length;
  const seg = [["ok", c.ok], ["warn", c.warn], ["err", c.err], ["gray", c.gray2]] as const;
  return (
    <CcHero
      stats={[{ value: String(items.length), label: t("admInt.total") }, { value: String(n("ok")), label: t("admInt.okCount"), color: c.ok }, { value: String(n("warn") + n("err")), label: t("admIntB.attention"), color: n("err") ? c.err : c.warn }]}
      segments={seg.map(([k, color]) => ({ key: k, value: n(k), color, label: `${t(`admIntB.tone.${k}`)} · ${n(k)}` }))}
    />
  );
}
