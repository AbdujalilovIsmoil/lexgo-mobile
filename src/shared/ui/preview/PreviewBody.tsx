import { useState } from "react";
import { ScrollView } from "react-native";
import type { ClassKind } from "@/shared/lib/download";
import { extOf } from "@/shared/lib/download";
import { AudioView } from "./AudioView";
import { DocxView } from "./DocxView";
import { OfficeView } from "./OfficeView";
import { OtherView } from "./OtherView";
import { PdfView } from "./PdfView";
import { TextView } from "./TextView";
import { VideoView } from "./VideoView";
import { ZoomImage } from "./ZoomImage";

type Props = { uri: string; kind: ClassKind; name: string; mime?: string };

// Every format the app can show itself: images, PDF, audio, video, text and .docx; the other Office files render natively on iOS
// and anything left (archives, unknown types) offers the system "open with".
export function PreviewBody({ uri, kind, name, mime }: Props) {
  if (kind === "image") return <ImageBody key={uri} uri={uri} name={name} mime={mime} />;
  if (kind === "pdf") return <PdfView uri={uri} name={name} mime={mime} />;
  if (kind === "audio") return <AudioView uri={uri} title={name} />;
  if (kind === "video") return <VideoView uri={uri} />;
  if (kind === "text") return <TextView uri={uri} name={name} mime={mime} />;
  if (kind === "office" && (extOf(name) === "docx" || /wordprocessingml/.test(mime ?? ""))) return <DocxView uri={uri} name={name} mime={mime} />;
  if (kind === "office") return <OfficeView uri={uri} name={name} mime={mime} />;
  return <OtherView uri={uri} name={name} mime={mime} />;
}

// A picture the phone cannot decode (HEIC on some Android phones, a damaged file) offers "open with" instead of a blank screen.
function ImageBody({ uri, name, mime }: Omit<Props, "kind">) {
  const [broken, setBroken] = useState(false);
  if (broken) return <OtherView uri={uri} name={name} mime={mime} />;
  return <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}><ZoomImage uri={uri} onError={() => setBroken(true)} /></ScrollView>;
}
