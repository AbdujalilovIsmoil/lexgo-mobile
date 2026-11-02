import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import { z } from "zod";
import { useConflictCheck, useCreateClient, type ConflictResult } from "@/entities/pro-clients";
import { ConflictView, digits, splitList } from "@/features/pro-client-form";
import { FormInput, FormPhoneInput, rules, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { radius, useColors } from "@/shared/theme";
import { Button, Icon, PressableScale, Text } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";

const pinfl = z.string().refine((v) => v === "" || /^\d{14}$/.test(v), rules.m("digits"));
// The page asks for what the design asks for (name and phone, both required, and a note); the conflict-check data (PINFL, company,
// opponents, representatives) is optional and folded away under "Qo'shimcha".
const schema = z.object({ name: rules.text(2, 120), phone: rules.phone, notes: rules.optText(2000), pinfl, company: rules.optText(160), opponents: rules.optText(500), reps: rules.optText(500) });
const EMPTY = { name: "", phone: "", notes: "", pinfl: "", company: "", opponents: "", reps: "" };

// /pro/clients/new — a client from outside LexGo (POST /lawyers/me/clients). Saving first runs the conflict check (its failure never blocks
// saving); a potential conflict is shown for a moment before the page closes. Such a client is visible to this professional only.
export function NewClientPage() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const f = useAppForm(schema, EMPTY);
  const [more, setMore] = useState(false);
  const [res, setRes] = useState<ConflictResult | null>(null);
  const create = useCreateClient();
  const check = useConflictCheck();
  const done = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/clients" as never));
  const save = f.handleSubmit(async (v) => {
    const opponents = splitList(v.opponents);
    const representatives = splitList(v.reps);
    const found = await check.mutateAsync({ phone: v.phone, pinfl: v.pinfl, opponent: opponents[0], representatives }).catch(() => null);
    setRes(found);
    create.mutate(
      { name: v.name.trim(), phone: v.phone.trim(), pinfl: v.pinfl, company: v.company, notes: v.notes, opponents, representatives },
      { onSuccess: () => setTimeout(done, found && !found.clear ? 2500 : 0) },
    );
  });
  const busy = create.isPending || check.isPending;
  const req = (label: string) => `${label} *`;
  return (
    <AdminPage
      title={t("aw3.add")}
      footer={<Button title={t("aw3.page.save")} variant="gradient" size="lg" full loading={busy} onPress={() => void save()} />}
    >
      <KeyboardAwareScrollView bottomOffset={28} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
        <FormInput control={f.control} name="name" label={req(t("aw3.page.name"))} placeholder={t("aw3.page.namePh")} autoCapitalize="words" />
        <FormPhoneInput control={f.control} name="phone" label={req(t("aw3.page.phone"))} />
        <FormInput control={f.control} name="notes" label={t("aw3.f.notes")} placeholder={t("aw3.page.notesPh")} multiline style={s.area} />
        <PressableScale onPress={() => setMore((x) => !x)} scale={0.99} accessibilityRole="button" accessibilityState={{ expanded: more }} style={[s.more, { borderColor: c.line }]}>
          <View style={s.flex}>
            <Text variant="body" weight="semibold">{t("aw3.page.more")}</Text>
            <Text variant="caption" tone="gray">{t("aw3.page.moreSub")}</Text>
          </View>
          <Icon name={more ? "chevron-up" : "chevron-down"} size={20} tone="gray" />
        </PressableScale>
        {more ? (
          <View style={s.group}>
            <FormInput control={f.control} name="pinfl" label={t("aw3.f.pinfl")} format={(x) => digits(x, 14)} keyboardType="number-pad" placeholder={t("aw3.f.pinflPh")} />
            <FormInput control={f.control} name="company" label={t("aw3.f.company")} />
            <FormInput control={f.control} name="opponents" label={t("aw3.f.opponents")} placeholder={t("aw3.f.listPh")} />
            <FormInput control={f.control} name="reps" label={t("aw3.f.reps")} placeholder={t("aw3.f.listPh")} />
          </View>
        ) : null}
        <View style={[s.info, { backgroundColor: c.tint }]}>
          <View style={[s.infoIco, { backgroundColor: c.accent }]}><Icon name="info" size={17} color="#FFFFFF" /></View>
          <Text variant="small" weight="semibold" style={[s.flex, { color: c.accentStrong }]}>{t("aw3.page.private")}</Text>
        </View>
        {res ? <ConflictView r={res} /> : null}
      </KeyboardAwareScrollView>
    </AdminPage>
  );
}

const s = StyleSheet.create({
  body: { padding: 16, gap: 14, paddingBottom: 32 },
  area: { minHeight: 110, textAlignVertical: "top" },
  flex: { flex: 1 },
  more: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: radius.r, borderWidth: 1, borderStyle: "dashed" },
  group: { gap: 14 },
  info: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.r },
  infoIco: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
