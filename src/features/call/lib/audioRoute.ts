import { Platform } from "react-native";
import { AudioSession } from "./livekit";

// Loudspeaker by default (a meeting is rarely held to the ear); a headset or Bluetooth device wins automatically.
export async function startAudio(): Promise<void> {
  await AudioSession.configureAudio({
    android: { preferredOutputList: ["bluetooth", "headset", "speaker", "earpiece"], audioTypeOptions: { manageAudioFocus: true, audioMode: "inCommunication", audioFocusMode: "gain", audioStreamType: "voiceCall", audioAttributesUsageType: "voiceCommunication", audioAttributesContentType: "speech" } },
    ios: { defaultOutput: "speaker" },
  });
  await AudioSession.startAudioSession();
}

export const stopAudio = () => AudioSession.stopAudioSession().catch(() => undefined);

/** Switches between loudspeaker and earpiece. */
export async function setSpeaker(on: boolean): Promise<void> {
  const target = Platform.OS === "ios" ? (on ? "force_speaker" : "default") : on ? "speaker" : "earpiece";
  await AudioSession.selectAudioOutput(target);
}
