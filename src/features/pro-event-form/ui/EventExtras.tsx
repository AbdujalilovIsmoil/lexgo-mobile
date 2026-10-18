import { View } from "react-native";
import { icalPath, useCascade, type CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { downloadAndShare } from "@/shared/lib/files";
import { Button, toast } from "@/shared/ui";

// Edit-only actions of an event: export to the phone calendar (.ics) and the reminder cascade.
export function EventExtras({ event }: { event: CalEvent }) {
  const { t } = useT();
  const cascade = useCascade();
  const share = () => downloadAndShare(icalPath(event.id), `${event.id}.ics`, "text/calendar").catch(() => toast(t("aw6.icalFail"), "err"));
  return (
    <View style={{ gap: 8 }}>
      <Button title={t("aw6.ical")} icon="download" variant="soft" full onPress={() => void share()} />
      <Button title={t("aw6.cascade")} icon="bell" variant="soft" full loading={cascade.isPending} onPress={() => cascade.mutate(event.id)} />
    </View>
  );
}
