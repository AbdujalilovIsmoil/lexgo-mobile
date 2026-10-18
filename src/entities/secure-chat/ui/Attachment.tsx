import { ActivityIndicator, Image, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { isImage, localFile } from "../api/files";
import { chatKeys } from "../model/queries";
import type { Msg } from "../model/types";
import { FileCard } from "./FileCard";
import { VoicePlayer } from "./VoicePlayer";

export type OpenFile = { uri?: string; path?: string; name: string; mime?: string };
type Props = { msg: Msg; fg: string; onOpen: (f: OpenFile) => void };

// The file part of a bubble: a photo thumbnail, a voice note player or a document card. Everything is
// fetched with the bearer token (never a bare URL) and cached on the device for this session.
export function Attachment({ msg, fg, onOpen }: Props) {
  const { t } = useT();
  const f = msg.file;
  const photo = isImage(msg);
  const voice = msg.type === "voice";
  const q = useQuery({ queryKey: chatKeys.file(msg.id), queryFn: () => localFile(msg), enabled: (photo || voice) && !msg.pending && !!msg.id, staleTime: Infinity });
  const uri = msg.localUri ?? q.data;
  const open = () => onOpen(uri ? { uri, name: f?.name ?? "", mime: f?.mime } : { path: f?.path, name: f?.name ?? "", mime: f?.mime });
  if (voice)
    return uri ? <VoicePlayer uri={uri} seed={msg.id || f?.name || "v"} fg={fg} /> : <Text variant="small" style={{ color: fg }}>{q.isError ? t("ms4.voiceFailed") : t("ms4.voiceLoading")}</Text>;
  if (photo)
    return (
      <PressableScale onPress={uri ? open : () => void q.refetch()} style={s.photo}>
        {uri ? <Image source={{ uri }} style={s.img} resizeMode="cover" /> : q.isError ? <Icon name="image" size={26} tone="gray" /> : <ActivityIndicator />}
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
