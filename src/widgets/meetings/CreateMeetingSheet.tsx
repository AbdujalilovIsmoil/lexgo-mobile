import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheet, Button, IconButton, Segmented, SheetScroll, Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { PeoplePicker, type Person } from "@/entities/person-search";
import type { CallType } from "@/entities/call";
import { MEETING_MINUTES, useCreateMeeting } from "@/features/meeting";
import { useSession } from "@/entities/session";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { FormatTiles } from "./FormatTiles";
import { PeopleBlock } from "./PeopleBlock";
import { SheetPages } from "./SheetPages";
import { meetingSchema } from "./meetingSchema";

const SNAPS = [0.92];
const TITLE_MAX = 120;

// "New meeting" in ONE sheet with two pages that slide: 1) a name, Video / Audio, how long, the participants (avatar
// stack + "+"), Start; 2) the people picker. Back returns to page 1 with the selection kept. Only accounts that may start
// calls (meetings.manage or a call-centre role) get this sheet; everybody can still join meetings they were invited to.
export function CreateMeetingSheet({ visible, onClose, initialType = "video" }: { visible: boolean; onClose: () => void; initialType?: CallType }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const me = useSession()?.user.id ?? "";
  const f = useAppForm(meetingSchema, { title: "", ids: [] as string[] });
  const [type, setType] = useState<CallType>(initialType);
  const [minutes, setMinutes] = useState(MEETING_MINUTES[0]);
  const [picked, setPicked] = useState<Person[]>([]);
  const [page, setPage] = useState<0 | 1>(0);
  const [seen, setSeen] = useState(false); // the picker loads people only once it was opened
  const title = f.watch("title");
  const pickPeople = (p: Person[]) => { setPicked(p); f.setValue("ids", p.map((u) => u.id), { shouldValidate: true }); };
  const openPeople = () => { setSeen(true); setPage(1); };
  const close = () => { setPage(0); onClose(); };
  const start = useCreateMeeting(() => { close(); f.reset({ title: "", ids: [] }); setPicked([]); });
  const submit = f.handleSubmit((v) => start.mutate({ title: v.title, ids: v.ids, type, minutes }));
  return (
    <BottomSheet visible={visible} onClose={close} title={t("admMeet.createTitle")} snaps={SNAPS} guardClose={() => { if (page === 1) { setPage(0); return true; } return false; }}>
      <SheetPages page={page}>
        <View style={s.page}>
          <SheetScroll contentContainerStyle={s.body}>
            <View style={s.field}>
              <View style={s.labelRow}>
                <Text variant="small" tone="gray" style={s.grow}>{t("admMeet.titleLabel")}</Text>
                <Text variant="caption" tone="gray2" accessibilityElementsHidden>{title.length}/{TITLE_MAX}</Text>
              </View>
              <FormInput control={f.control} name="title" placeholder={t("admMeet.titlePh")} maxLength={TITLE_MAX} accessibilityLabel={t("admMeet.titleLabel")} />
            </View>
            <View style={s.field}>
              <Text variant="small" tone="gray">{t("ms7.format")}</Text>
              <FormatTiles value={type} onChange={setType} />
            </View>
            <View style={s.field}>
              <Text variant="small" tone="gray">{t("ms7.length")}</Text>
              <Segmented value={String(minutes)} onChange={(v) => setMinutes(Number(v))} options={MEETING_MINUTES.map((m) => ({ value: String(m), label: t("meetUx.min", { n: m }) }))} />
            </View>
            <PeopleBlock picked={picked} error={!!f.formState.errors.ids} onOpen={openPeople} />
          </SheetScroll>
          <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
            <Button title={t("meetUx.cancel")} variant="line" onPress={close} style={s.cancel} full />
            <Button title={t("meetUx.go")} icon={type === "audio" ? "mic" : "video"} variant="gradient" onPress={() => void submit()} loading={start.isPending} style={s.go} full />
          </View>
        </View>
        <View style={s.page}>
          <View style={s.top}>
            <IconButton icon="arrow-left" size={44} label={t("common.back")} onPress={() => setPage(0)} />
            <Text variant="h4" style={s.grow}>{t("meetUx.people")}</Text>
          </View>
          <PeoplePicker me={me} enabled={visible && seen} selected={picked} onChange={pickPeople} onDone={() => setPage(0)} min={1} />
        </View>
      </SheetPages>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  page: { flex: 1 },
  body: { gap: 20, paddingTop: 8, paddingBottom: 20 },
  field: { gap: 8 },
  labelRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 4 },
  grow: { flex: 1 },
  bar: { flexDirection: "row", gap: 10, paddingHorizontal: 18, paddingTop: 10, borderTopWidth: 1 },
  cancel: { flex: 1 },
  go: { flex: 2 },
  top: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingTop: 2 },
});
