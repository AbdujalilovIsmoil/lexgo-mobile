import { View } from "react-native";
import type { ProService, ServiceScope } from "@/entities/pro-service";
import { SERVICE_STATUSES } from "@/entities/pro-service";
import { FormInput } from "@/shared/form";
import { Button, Text } from "@/shared/ui";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";
import { BandCard } from "./BandCard";
import { PriceField } from "./PriceField";
import { ServicePicker } from "./ServicePicker";
import { useServiceForm } from "./useServiceForm";

type Props = { visible: boolean; onClose: () => void; item: ProService | null; taken: Set<string>; sellerId: string; region: string; yurist: boolean; scope?: ServiceScope };

// Add or edit one service. The price is checked against the server's corridor before and after sending (422 text is shown).
export function ServiceFormSheet({ visible, onClose, item, taken, sellerId, region, yurist, scope }: Props) {
  const { t } = useT();
  const som = useSom();
  const f = useServiceForm({ visible, item, sellerId, region, scope, onDone: onClose });
  const band = f.band;
  const issue = f.issue ? t(`sl7.err.${f.issue}`, { min: som(band?.min ?? 0), max: som(band?.max ?? 0) }) : undefined;
  const e = f.err;
  const text = e ? (e.kind === "range" && e.limits ? [t("sl7.err.range", { min: som(e.limits.min), max: som(e.limits.max) }), e.detail].filter(Boolean).join("\n") : e.detail && ["invalid", "unknown", "forbidden"].includes(e.kind) ? e.detail : t(`sl7.err.${e.kind}`)) : "";
  return (
    <FormSheet visible={visible} onClose={onClose} title={t(item ? "sl7.editTitle" : "ntd.sellerV2.svc.pickTitle")} onSubmit={() => void f.submit()} submitting={f.saving} disabled={!f.picked || !!f.issue}>
      {!f.picked ? (
        <ServicePicker onPick={f.setPicked} taken={taken} yurist={yurist} />
      ) : (
        <>
          <View style={{ gap: 2 }}>
            <Text variant="body" weight="bold">{f.picked.name}</Text>
            <Text variant="caption" tone="gray">{f.picked.category}</Text>
            {!item ? <Button title={t("sl7.change")} variant="ghost" size="sm" onPress={f.change} /> : null}
          </View>
          <PriceField value={f.values.price} onChange={(v) => f.set("price", v)} band={band} error={issue ?? (e?.kind === "range" ? text : undefined)} catalogPrice={f.picked.catalogPrice} />
          <BandCard band={band} loading={f.bandLoading} price={f.n} />
          {f.n === 0 && f.picked.catalogPrice === 0 ? <Notice tone="warn" text={t("sl7.priceless")} /> : null}
          <FormInput control={f.form.control} name="note" label={t("sl7.note")} multiline maxLength={2000} hint={`${f.values.note.length}/2000 · ${t("sl7.noteHint")}`} />
          <SelectField label={t("sl7.status")} value={f.values.status} options={SERVICE_STATUSES.map((s) => ({ value: s, label: t(`sl6.status.${s}`) }))} onChange={(v) => f.set("status", v)} />
          {e && e.kind !== "range" ? <Notice tone="err" text={text} /> : null}
        </>
      )}
    </FormSheet>
  );
}
