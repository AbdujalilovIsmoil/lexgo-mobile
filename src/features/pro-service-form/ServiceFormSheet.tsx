import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { ProSeller, ProService } from "@/entities/pro-service";
import { NOTE_MAX, serviceErrorKey } from "@/entities/pro-service";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { BottomSheet, Button, Input, SheetScroll, Text } from "@/shared/ui";
import { Notice } from "@/shared/ui/sel";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { BandCard } from "./BandCard";
import { PolicyCheck } from "./PolicyCheck";
import { PriceField } from "./PriceField";
import { Section } from "./Section";
import { SelectedService } from "./SelectedService";
import { ServicePicker } from "./ServicePicker";
import { StatusCards } from "./StatusCards";
import { PreviewSheet } from "./preview/PreviewSheet";
import { useServiceForm } from "./useServiceForm";

type Props = { visible: boolean; onClose: () => void; item: ProService | null; taken: Set<string>; sellerId: string; region: string; yurist: boolean; seller: ProSeller; services?: ProService[] };

// Add or edit one service, laid out as on the web: Xizmat, Narx, Tajriba izohi, Holat, the price policy and a sticky action bar.
// Fields that need a service stay visible but disabled until one is picked. The price is checked against the server's corridor
// before and after sending (422 text is shown).
export function ServiceFormSheet({ visible, onClose, item, taken, sellerId, region, yurist, seller, services = [] }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const f = useServiceForm({ visible, item, sellerId, region, onDone: onClose });
  const [preview, setPreview] = useState(false);
  useSheetReset(visible, () => setPreview(false));
  const band = f.band;
  const e = f.err;
  const range = (b: { min: number; max: number }) => ({ min: fmtMoney(b.min), max: fmtMoney(b.max) });
  const issue = f.issue ? t("proSvc.form.priceOut", range(band ?? { min: 0, max: 0 })) : undefined;
  // The server's own words are kept for the generic failures; everything else uses the web's texts.
  const text = e ? (e.kind === "range" && e.limits ? t("proSvc.errors.range", range(e.limits)) : ["invalid", "unknown"].includes(e.kind) && e.detail ? e.detail : t(serviceErrorKey(e.kind))) : "";
  const title = t(item ? "proSvc.form.editTitle" : "proSvc.form.addTitle");
  const picked = f.picked;
  const none = !picked;
  return (
    <>
      <BottomSheet visible={visible} onClose={onClose} title={title} snaps={[0.94]}>
        <SheetScroll contentContainerStyle={s.body}>
          <Section icon="layers" label={t("proSvc.form.service")}>
            {picked ? <SelectedService service={picked} onChange={item ? undefined : f.change} /> : <ServicePicker onPick={f.setPicked} taken={taken} yurist={yurist} />}
          </Section>
          <Section icon="tag" label={t("proSvc.form.price")} muted={none}>
            {picked && picked.catalogPrice === 0 ? <Notice tone="warn" text={t("proSvc.form.noCatalogPrice")} /> : null}
            <PriceField value={f.values.price} onChange={(v) => f.set("price", v)} band={band} error={issue ?? (e?.kind === "range" ? text : undefined)} catalogPrice={picked?.catalogPrice ?? 0} disabled={none} />
            {picked ? <BandCard band={band} loading={f.bandLoading} price={f.n} /> : null}
          </Section>
          <Section icon="edit-3" label={t("proSvc.form.note")} right={`${f.values.note.length}/${NOTE_MAX}`} muted={none}>
            <Input accessibilityLabel={t("proSvc.form.note")} value={f.values.note} onChangeText={(v) => f.set("note", v.slice(0, NOTE_MAX))} editable={!none} multiline maxLength={NOTE_MAX} placeholder={t("proSvc.form.notePh")} hint={t("proSvc.form.noteHint")} style={s.note} />
          </Section>
          <Section icon="play" label={t("proSvc.form.status")} muted={none}>
            <StatusCards value={f.values.status} onChange={(v) => f.set("status", v)} disabled={none} />
          </Section>
          <View style={none ? s.dim : undefined}>
            <PolicyCheck checked={f.agreed} onChange={f.setAgreed} error={f.policyMissing} disabled={none} />
          </View>
          {none ? <Text variant="caption" tone="gray2" center>{t("proSvc.formUi.pickFirst")}</Text> : null}
          {e && e.kind !== "range" ? <Notice tone="err" text={text} /> : null}
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
          <Button title={t("proSvc.preview.open")} icon="eye" variant="soft" size="sm" full onPress={() => setPreview(true)} />
          <View style={s.pair}>
            <Button title={t("proSvc.form.cancel")} variant="line" onPress={onClose} style={s.half} full />
            <Button title={t(f.saving ? "proSvc.form.saving" : "proSvc.form.save")} icon="check" iconRight variant="gradient" onPress={() => void f.submit()} loading={f.saving} disabled={!f.valid} style={s.save} full />
          </View>
        </View>
        {/* Inside the form sheet, not beside it: a native Modal can only be presented from the one that is already on screen. */}
        <PreviewSheet visible={visible && preview} onClose={() => setPreview(false)} subtitle={title} seller={seller} sellerId={sellerId} region={region} items={services} editingId={item?.id ?? ""} picked={picked} price={f.n} note={f.values.note} />
      </BottomSheet>
    </>
  );
}

const s = StyleSheet.create({
  body: { paddingTop: 12, paddingBottom: 20, gap: 22 },
  note: { minHeight: 120, textAlignVertical: "top" },
  dim: { opacity: 0.55 },
  bar: { paddingHorizontal: 18, paddingTop: 10, gap: 10, borderTopWidth: 1 },
  pair: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  save: { flex: 1.3 },
});
