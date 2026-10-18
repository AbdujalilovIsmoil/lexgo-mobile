import { VideoView as NativeVideo, useVideoPlayer } from "expo-video";

export function VideoView({ uri }: { uri: string }) {
  const player = useVideoPlayer({ uri }, (p) => p.play());
  return <NativeVideo player={player} style={{ width: "100%", height: 320 }} nativeControls contentFit="contain" />;
}
