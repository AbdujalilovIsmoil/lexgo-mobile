import { View } from "react-native";
import { Button, Pill, Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useStudioText, type StudioGrant } from "@/entities/admin-studio";
import { fmtDate } from "@/shared/lib/format";

type Props = { g: StudioGrant; busy: boolean; onEdit: () => void; onToggle: () => void };

// A user's studio access: roles, which constructors, active or paused; edit / pause / turn back on.
export function GrantRow({ g, busy, onEdit, onToggle }: Props) {
  const { t, role, locale } = useStudioText();
  const name = g.userName || g.phone || g.userId;
  return (
    <RowCard
      avatar={name}
      title={name}
      subtitle={[g.phone && g.phone !== name ? g.phone : "", g.lexgoId ? `LexGo ID ${g.lexgoId}` : ""].filter(Boolean).join(" · ")}
      meta={g.createdAt ? t("admStudioC.access.since", { d: fmtDate(g.createdAt, locale) }) : undefined}
      right={<Pill label={t(g.active ? "admStudioC.access.active" : "admStudioC.access.paused")} tone={g.active ? "ok" : "gray"} small />}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {g.roles.map((r) => <Pill key={r} label={role(r)} tone="blue" small />)}
        {g.codes.length ? g.codes.slice(0, 6).map((c) => <Pill key={c} label={c} tone="gray" small />) : <Text variant="caption" tone="gray">{t("admStudioC.access.allCtors")}</Text>}
        {g.codes.length > 6 ? <Text variant="caption" tone="gray">+{g.codes.length - 6}</Text> : null}
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button title={t("adm.edit")} icon="edit-2" variant="soft" size="sm" onPress={onEdit} />
        <Button title={t(g.active ? "admStudioC.access.pause" : "admStudioC.access.resume")} icon={g.active ? "pause-circle" : "play-circle"} variant="line" size="sm" loading={busy} onPress={onToggle} />
      </View>
    </RowCard>
  );
}
