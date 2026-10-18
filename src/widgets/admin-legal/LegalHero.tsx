import { CcHero } from "@/shared/ui/cc";
import { REQUIRED_SLUGS, type DocSlot } from "@/entities/admin-legal";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Headline of the documents tab: how many of the 10 required documents are ready, plus a bar of ready / stub / missing.
export function LegalHero({ slots }: { slots: DocSlot[] }) {
  const { t } = useT();
  const c = useColors();
  const n = (s: DocSlot["state"]) => slots.filter((x) => x.state === s && REQUIRED_SLUGS.includes(x.slug)).length;
  const versions = slots.reduce((sum, s) => sum + s.versions.length, 0);
  return (
    <CcHero
      stats={[{ value: `${n("ready")} / ${REQUIRED_SLUGS.length}`, label: t("admLegalC.hero.ready"), color: n("ready") === REQUIRED_SLUGS.length ? c.ok : undefined }, { value: String(versions), label: t("admLegalC.hero.versions") }]}
      segments={[
        { key: "ready", value: n("ready"), color: c.ok, label: `${t("admLegalC.hero.ready")} ${n("ready")}` },
        { key: "ph", value: n("placeholder"), color: c.warn, label: `${t("admLegalC.hero.placeholder")} ${n("placeholder")}` },
        { key: "miss", value: n("missing"), color: c.gray2, label: `${t("admLegalC.hero.missing")} ${n("missing")}` },
      ]}
    />
  );
}
