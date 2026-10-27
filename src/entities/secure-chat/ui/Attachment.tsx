import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import { isImage, localFile } from "../api/files";
import { chatKeys } from "../model/queries";
import type { Msg } from "../model/types";
import { FileCard } from "./FileCard";
import { VoicePlayer } from "./VoicePlayer";

export type OpenFile = { uri?: string; path?: string; name: string; mime?: string };
type Props = { msg: Msg; fg: string; onOpen: (f: OpenFile) => void };

// Pictures this phone could not draw, for this session: a bubble scrolled away and back does not try (and flash) again.
const undrawable = new Set<string>();
registerSessionReset(() => undrawable.clear());

// The file part of a bubble: a photo thumbnail, a voice note player or a document card. Everything is
// fetched with the bearer token (never a bare URL) and cached on the device for this session.
// HEIC is stored as sent (the backend makes no JPEG copy) and not every phone can decode it: a picture that fails to draw becomes a
// file card, which opens it in the viewer, with "open with" / share from there.
export function Attachment({ msg, fg, onOpen }: Props) {
  const { t } = useT();
  const [badUri, setBadUri] = useState("");
  const f = msg.file;
  const image = isImage(msg);
  const voice = msg.type === "voice";
  const q = useQuery({ queryKey: chatKeys.file(msg.id), queryFn: () => localFile(msg), enabled: (image || voice) && !msg.pending && !!msg.id, staleTime: Infinity });
  const uri = msg.localUri ?? q.data;
  const photo = image && !(uri && (badUri === uri || undrawable.has(uri)));
  const open = () => onOpen(uri ? { uri, name: f?.name ?? "", mime: f?.mime } : { path: f?.path, name: f?.name ?? "", mime: f?.mime });
  const broken = (bad: string) => {
    undrawable.add(bad);
    setBadUri(bad);
  };
  if (voice)
    return uri ? <VoicePlayer uri={uri} seed={msg.id || f?.name || "v"} fg={fg} /> : <Text variant="small" style={{ color: fg }}>{q.isError ? t("ms4.voiceFailed") : t("ms4.voiceLoading")}</Text>;
  if (photo)
    return (
      <PressableScale onPress={uri ? open : () => void q.refetch()} style={s.photo}>
        {uri ? <Image source={{ uri }} style={s.img} resizeMode="cover" onError={() => broken(uri)} /> : q.isError ? <Icon name="image" size={26} tone="gray" /> : <ActivityIndicator />}
        {msg.pending ? <ActivityIndicator style={s.spin} color="#FFFFFF" /> : null}
      </PressableScale>
    );
  return <FileCard msg={msg} fg={fg} onOpen={open} />;
}

const s = StyleSheet.create({
  photo: { width: 220, height: 220, borderRadius: 14, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(127,127,127,0.18)" },
  img: { width: "100%", height: "100%" },
  spin: { position: "absolute" },
});
