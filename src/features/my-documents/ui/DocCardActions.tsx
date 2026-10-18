import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, IconButton, toast, type IconName } from "@/shared/ui";
import { ActionList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { chatPath, docFileName, docPath, useDocChat, type DocRow } from "@/entities/my-document";
import { useShare } from "../model/useShare";
import { CtorSheet } from "./CtorSheet";

type Props = { row: DocRow; onSend: (id: string) => void };
type Act = { key: string; label: string; icon: IconName; onPress: () => void };
const MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// What can be done with a document, by the web's rules: download · continue · chat · send to an advocate. The card shows
// the one that matters most as a button and keeps the rest (and "why not") behind a "more" menu.
export function DocCardActions({ row, onSend }: Props) {
  const { t } = useT();
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [menu, setMenu] = useState(false);
  const dl = useShare();
  const held = row.mode === "lawyer" || row.lawyerActive || !!row.lawyer;
  const chat = useDocChat(row.id, held);
  const room = chat.data?.available ? chat.data.roomId : "";
  const closed = ["closed", "cancelled", "rejected"].includes(row.status);
  const waiting = row.paymentRequired && !row.fileReady;
  const canContinue = row.ctor?.available === true;
  const canSend = row.mode === "manual" && !closed && !waiting && row.canSend;
  const go = () => router.push(docPath(row.id) as never);
  const download = () => void dl.share({ path: `/document-requests/${encodeURIComponent(row.id)}/file`, name: docFileName(row.title, row.format, "document"), mime: MIME });
  const acts: Record<string, Act | null> = {
    dl: row.fileReady ? { key: "dl", label: t("dm11.actDownload"), icon: "download", onPress: download } : null,
    go: canContinue ? { key: "go", label: t("dm11.actContinue"), icon: "edit-3", onPress: row.ctor?.promptRequired ? () => setAsking(true) : go } : null,
    chat: room ? { key: "chat", label: t("dm11.actChat"), icon: "message-circle", onPress: () => router.push(chatPath(room) as never) } : null,
    send: canSend ? { key: "send", label: t("dm11.actSend"), icon: "shield", onPress: () => onSend(row.id) } : null,
    why: !canSend && row.mode === "manual" && !closed && !row.fileReady && row.blockReason ? { key: "why", label: t("dm11.why"), icon: "info", onPress: () => toast(row.blockReason, "info") } : null,
  };
  const first = room && !row.fileReady ? "chat" : row.fileReady ? "dl" : canContinue ? "go" : room ? "chat" : "send";
  const list = [first, "dl", "go", "chat", "send", "why"].filter((k, i, a) => a.indexOf(k) === i).map((k) => acts[k]).filter((a): a is Act => !!a);
  if (!list.length) return null;
  const [main, ...rest] = list;
  return (
    <View style={s.row}>
      <Button title={main.key === "dl" && dl.busy ? `${main.label}…` : main.label} icon={main.icon} size="sm" variant={main.key === "why" ? "ghost" : "primary"} disabled={main.key === "dl" && dl.busy} onPress={main.onPress} />
      {rest.length ? <IconButton icon="more-horizontal" size={38} label={t("dm11.more")} onPress={() => setMenu(true)} /> : null}
      <ActionList visible={menu} onClose={() => setMenu(false)} actions={rest} />
      <CtorSheet visible={asking} title={row.ctor?.title || t("dm3.ctorTitle")} message={row.ctor?.message || t("dm3.ctorText")} onYes={go} onClose={() => setAsking(false)} />
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 8 } });
