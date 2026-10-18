import { View } from "react-native";
import { FormInput } from "@/shared/form";
import { Button, Text } from "@/shared/ui";
import { FormSheet, RowCard, SelectField, SwitchField } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { outOfBand, useServiceErrorText, type ManagedList, type ManagedService, type ServiceStatus } from "@/entities/organization";
import { useServiceBand } from "../model/useServiceBand";
import { useServiceForm } from "../model/useServiceForm";
import { PriceField } from "./PriceField";
import { ServicePicker } from "./ServicePicker";

type Props = { visible: boolean; orgId: string; memberId: string; seller: ManagedList | null; item: ManagedService | null; taken: Set<string>; onClose: () => void };
const STATUSES: ServiceStatus[] = ["active", "paused", "inactive"];

// Add a service to a member (catalog search → price inside the allowed range → note → status) or edit one.
export function ServiceFormSheet({ visible, orgId, memberId, seller, item, taken, onClose }: Props) {
  const { t } = useT();
  const errText = useServiceErrorText();
  const f = useServiceForm({ orgId, memberId, item }, onClose);
  useSheetReset(visible, f.reset);
  const { band, estimate, loading } = useServiceBand(f.svc?.id ?? "", memberId, seller?.region ?? "", f.serverBand ?? item?.band ?? null);
  const price = Number(f.price || 0);
  const blocked = f.err?.kind === "advocateOnly" || (!!f.svc?.advocateOnly && seller?.sellerKind === "yurist");
  const ready = !!f.svc && !blocked && !outOfBand(price, band) && (!f.needConsent || f.agreed);
  return (
    <FormSheet visible={visible} onClose={onClose} title={item ? t("og6.editTitle") : t("ntd.sellerV2.svc.pickTitle")} subtitle={seller?.sellerName} onSubmit={() => void f.submit()} submitLabel={t("adm.save")} submitting={f.busy} disabled={!ready}>
      {f.svc ? <RowCard icon="layers" title={f.svc.name} subtitle={f.svc.category} right={item ? undefined : <Button title={t("og6.change")} variant="soft" size="sm" onPress={() => f.pick(null)} />} /> : <ServicePicker taken={taken} onPick={f.pick} />}
      {f.svc ? (
        <View style={{ gap: 14 }}>
          {blocked ? <Text variant="small" tone="err">{t("og5.err.advocateOnly")}</Text> : null}
          <PriceField value={f.price} onChange={f.setPrice} band={band} estimate={estimate} loading={loading} catalogPrice={f.svc.catalogPrice} error={f.err?.kind === "range" ? errText(f.err) : undefined} />
          <FormInput control={f.form.control} name="note" label={t("og6.note")} placeholder={t("og6.notePh")} hint={`${f.note.length}/2000 · ${t("og6.noteHint")}`} multiline maxLength={2000} style={{ minHeight: 80 }} />
          <SelectField label={t("adm.status")} value={f.status} onChange={f.setStatus} options={STATUSES.map((s) => ({ value: s, label: t(`og5.status.${s}`) }))} />
          {f.needConsent ? <SwitchField label={t("og6.policy")} value={f.agreed} onChange={f.setAgreed} /> : null}
          {f.err && f.err.kind !== "range" && f.err.kind !== "advocateOnly" ? <Text variant="small" tone="err">{errText(f.err)}</Text> : null}
        </View>
      ) : null}
    </FormSheet>
  );
}
