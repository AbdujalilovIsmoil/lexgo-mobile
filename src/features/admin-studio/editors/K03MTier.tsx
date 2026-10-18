import { Card } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";
import { NumberField } from "../form/NumberField";
import { TagsField } from "../form/TagsField";
import { TextField } from "../form/TextField";
import type { Errors } from "../form/types";
import { str, strList } from "../form/values";

type Props = { tier: Dict; errors: Errors; readOnly: boolean; onPatch: (p: Dict) => void };

// One of the three fixed variants: own title, description, price, duration and included content.
export function K03MTier({ tier, errors, readOnly, onPatch }: Props) {
  const { t } = useT();
  return (
    <Block title={t(`ntd.studioV2.tier_${str(tier.tier)}`)}>
      <Card style={{ gap: 10 }}>
        <TextField label={t("ntd.studioV2.tierTitle")} value={str(tier.title)} onChange={(title) => onPatch({ title })} readOnly={readOnly} />
        <TextField label={t("ntd.studioV2.optDesc")} value={str(tier.description)} onChange={(description) => onPatch({ description })} readOnly={readOnly} multiline />
        <NumberField label={t("ntd.studioV2.tierPrice")} value={tier.price} onChange={(price) => onPatch({ price })} readOnly={readOnly} error={errors.price} required />
        <TextField label={t("ntd.studioV2.tierDuration")} value={str(tier.duration)} onChange={(duration) => onPatch({ duration })} readOnly={readOnly} placeholder="7 days" />
        <TagsField label={t("ntd.studioV2.tierIncluded")} value={strList(tier.included)} onChange={(included) => onPatch({ included })} readOnly={readOnly} />
      </Card>
    </Block>
  );
}
