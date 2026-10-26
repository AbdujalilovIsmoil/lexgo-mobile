import { useState } from "react";
import { useRouter } from "expo-router";
import { EventRow, isCancelled, useEvents } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { Panel } from "./Panel";

const NEXT = 4;

// "Kalendar" of the web dashboard as a short list: the next four court dates, meetings and deadlines (cancelled ones left out); each row
// opens the calendar. Nothing at all when the next days are empty — the hero already says "no meetings today".
export function UpcomingPanel({ i }: { i: number }) {
  const { t } = useT();
  const router = useRouter();
  const [now] = useState(Date.now); // read once when the home opens; a pull to refresh re-reads the events
  const next = (useEvents().data ?? []).filter((e) => !isCancelled(e) && Date.parse(e.endsAt || e.startsAt) >= now).sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, NEXT);
  if (!next.length) return null;
  const open = () => router.push("/pro/calendar" as never);
  return (
    <Panel i={i} icon="calendar" tint="#00A870" title={t("shm.dash.calendar")}>
      {next.map((e, k) => <EventRow key={e.id} event={e} withDate index={k} onPress={open} />)}
    </Panel>
  );
}
