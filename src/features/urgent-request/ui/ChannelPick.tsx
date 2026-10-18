import { Segmented } from "@/shared/ui";
import { Field } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Video or chat, offered only when the service sells more than one channel.
export function ChannelPick({ channels, value, onChange }: { channels: string[]; value: string; onChange: (v: string) => void }) {
  const { t } = useT();
  if (channels.length < 2) return null;
  return (
    <Field label={t("ug2.channel")}>
      <Segmented options={channels.map((c) => ({ value: c, label: t(c === "video" ? "ug4.ch.video" : "ug4.ch.chat"), icon: c === "video" ? ("video" as const) : ("message-circle" as const) }))} value={value} onChange={onChange} />
    </Field>
  );
}
