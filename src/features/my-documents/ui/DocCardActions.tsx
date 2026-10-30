import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useDocSettings } from "@/entities/doc-settings";
import { chatPath, docFileName, docPath, useDocChat, type DocRow } from "@/entities/my-document";
import { useShare } from "../model/useShare";
import { CtorSheet } from "./CtorSheet";

type Props = { row: DocRow; onSend: (id: string) => void };
type Act = { key: string; label: string; icon: IconName; onPress: () => void };
const MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// What can be done with a document, by the web's rules: download · continue · chat · send to an advocate. The list card
// shows only the one that matters most, as a single short button (the rest lives in the detail sheet). The document service settings
// (TZ.md §4) take away a download in a closed format and the review when the platform switched it off.
export function DocCardActions({ row, onSend }: Props) {
  const { t } = useT();
  const router = useRouter();
  const ds = useDocSettings();
  const [asking, setAsking] = useState(false);
  const dl = useShare();
  const held = row.mode === "lawyer" || row.lawyerActive || !!row.lawyer;
  const chat = useDocChat(row.id, held);
  const room = chat.data?.available ? chat.data.roomId : "";
  const closed = ["closed", "cancelled", "rejected"].includes(row.status);
  const waiting = row.paymentRequired && !row.fileReady;
  const canContinue = row.ctor?.available === true;
  const canSend = row.mode === "manual" && !closed && !waiting && row.canSend && ds.gate("review").state !== "off";
  // "Continue" opens the section constructor on this very request (a document that came from a template); others open their page.
  const go = () => router.push((row.templateId ? `/templates/${encodeURIComponent(row.templateId)}/fill?request=${encodeURIComponent(row.id)}` : docPath(row.id)) as never);
  const download = () => void dl.share({ path: `/document-requests/${encodeURIComponent(row.id)}/file`, name: docFileName(row.title, row.format, "document"), mime: MIME });
  const acts: Record<string, Act | null> = {
    dl: row.fileReady && ds.downloadOk(row.format) ? { key: "dl", label: t("dm11.actDownload"), icon: "download", onPress: download } : null,
    go: canContinue ? { key: "go", label: t("dm11.actContinue"), icon: "edit-3", onPress: row.ctor?.promptRequired ? () => setAsking(true) : go } : null,
    chat: room ? { key: "chat", label: t("dm11.actChat"), icon: "message-circle", onPress: () => router.push(chatPath(room) as never) } : null,
    send: canSend ? { key: "send", label: t("docSheet.act.review"), icon: "shield", onPress: () => onSend(row.id) } : null,
  };
  const first = room && !row.fileReady ? "chat" : row.fileReady ? "dl" : canContinue ? "go" : room ? "chat" : "send";
  const list = [first, "dl", "go", "chat", "send"].filter((k, i, a) => a.indexOf(k) === i).map((k) => acts[k]).filter((a): a is Act => !!a);
  if (!list.length) return null;
  const main = list[0];
  return (
    <View style={s.row}>
      <Button title={main.label} icon={main.icon} size="sm" variant="soft" loading={main.key === "dl" && dl.busy} onPress={main.onPress} style={s.btn} />
      <CtorSheet visible={asking} title={row.ctor?.title || t("dm3.ctorTitle")} message={row.ctor?.message || t("dm3.ctorText")} onYes={go} onClose={() => setAsking(false)} />
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", paddingLeft: 54 }, btn: { minHeight: 40 } }); // under the title, past the icon tile
