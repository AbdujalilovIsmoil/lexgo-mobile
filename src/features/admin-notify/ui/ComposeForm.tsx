import { View } from "react-native";
import { Input, Text } from "@/shared/ui";
import { CcTiles } from "@/shared/ui/cc";
import { CATEGORIES, CHANNELS } from "@/entities/admin-notify";
import { useT } from "@/shared/i18n";
import type { Compose } from "../model/useSender";

type Props = { value: Compose; onChange: (v: Compose) => void };

// Channel and category as tap tiles, then the title and the message.
export function ComposeForm({ value, onChange }: Props) {
  const { t } = useT();
  const set = <K extends keyof Compose>(k: K, v: Compose[K]) => onChange({ ...value, [k]: v });
  const pick = (label: string, tiles: { value: string; label: string }[], current: string, on: (v: string) => void) => (
    <View style={{ gap: 6 }}>
      <Text variant="kicker" tone="gray">{label}</Text>
      <View style={{ marginHorizontal: -16 }}><CcTiles options={tiles} value={current} onChange={on} /></View>
    </View>
  );
  return (
    <>
      {pick(t("admNtf.channel"), CHANNELS.map((c) => ({ value: c, label: t(`admNtf.channels.${c}`) })), value.channel, (v) => set("channel", v))}
      {pick(t("admNtf.category"), CATEGORIES.map((c) => ({ value: c, label: t(`admNtf.cats.${c}`) })), value.category, (v) => set("category", v))}
      <Input label={t("adm.title")} value={value.title} onChangeText={(v) => set("title", v)} returnKeyType="next" />
      <Input label={t("admNtf.body")} value={value.body} onChangeText={(v) => set("body", v)} multiline style={{ minHeight: 96, textAlignVertical: "top" }} />
    </>
  );
}
