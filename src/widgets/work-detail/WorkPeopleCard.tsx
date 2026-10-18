import { StyleSheet, View } from "react-native";
import { workGroup, type WorkDetail, type WorkPerson } from "@/entities/work";
import { useWorkNav } from "@/features/work-actions";
import { Avatar, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { ChatCard } from "./ChatCard";

function Person({ person, label }: { person: WorkPerson; label: string }) {
  return (
    <View style={s.row}>
      <Avatar name={person.name} size={44} />
      <View style={s.col}>
        <Text variant="body" weight="bold" numberOfLines={1}>{person.name}</Text>
        <Text variant="caption" tone="gray">{label}</Text>
      </View>
    </View>
  );
}

// Who works on it (name and role only — never a phone number) and the ways to reach them.
export function WorkPeopleCard({ detail }: { detail: WorkDetail }) {
  const { t } = useT();
  const nav = useWorkNav();
  const { work, roomId, callId } = detail;
  const role = (r: string) => (t(`cl4.people.${r}`) !== `cl4.people.${r}` ? t(`cl4.people.${r}`) : t("cl4.people.specialist"));
  const waiting = !work.assignee && workGroup(work.status) === "queue";
  if (!work.assignee && !work.operator && !roomId && !waiting) return null;
  return (
    <SectionCard title={t("cl4.people.title")}>
      {work.assignee ? <Person person={work.assignee} label={role(work.assignee.role)} /> : null}
      {waiting ? <Text variant="small" tone="gray">{t("cl4.people.waiting")}</Text> : null}
      {work.operator ? <Person person={work.operator} label={t("cl4.people.operator")} /> : null}
      {roomId ? <ChatCard person={work.assignee ?? work.operator} onChat={() => nav.chat(roomId)} onCall={callId ? () => nav.call(roomId, callId) : undefined} /> : null}
    </SectionCard>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  col: { flex: 1, gap: 2 },
});
