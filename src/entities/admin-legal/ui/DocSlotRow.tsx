import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { DocSlot } from "../model/types";

const TONE = { ready: "ok", placeholder: "warn", missing: "gray" } as const;
export const useSlugName = () => {
  const { t } = useT();
  return (slug: string) => (t(`admLegal.slugs.${slug}`) !== `admLegal.slugs.${slug}` ? t(`admLegal.slugs.${slug}`) : humanizeSlug(slug));
};

type Props = { slot: DocSlot; canEdit: boolean; onPress: () => void; onNew: () => void };

// One required document as a ticket: state strip and badge, version/date chips, round buttons (read, publish a new version).
export function DocSlotRow({ slot, canEdit, onPress, onNew }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const name = useSlugName();
  const cur = slot.current;
  const tint = { ready: c.ok, placeholder: c.warn, missing: c.gray2 }[slot.state];
  return (
    <CcTicket
      tint={tint} icon="file-text" title={name(slot.slug)} subtitle={slot.slug} onPress={onPress}
      badge={<Pill small tone={TONE[slot.state]} label={t(`admLegal.state.${slot.state}`)} />}
      chips={<>
        {cur ? <Pill small tone="blue" label={`v${cur.version}`} /> : null}
        {slot.versions.length > 1 ? <Pill small tone="gray" label={t("admLegal.versions", { n: slot.versions.length })} /> : null}
        {cur ? <Pill small tone="gray" label={fmtDate(cur.createdAt, locale)} /> : null}
      </>}
      actions={<>
        {cur ? <CcAction icon="eye" label={t("admLegalC.view")} onPress={onPress} /> : null}
        {canEdit ? <CcAction primary icon={cur ? "plus" : "upload-cloud"} label={cur ? t("admLegal.newVersion") : t("admLegal.publish")} onPress={onNew} /> : null}
      </>}
    />
  );
}
