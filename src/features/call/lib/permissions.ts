import { PermissionsAndroid, Platform } from "react-native";

export type MediaAccess = { mic: boolean; cam: boolean };

// Android asks for camera / microphone up front so a refusal is known before connecting;
// iOS shows its own prompt the first time WebRTC opens the device (texts come from app.json).
export async function askMediaAccess(video: boolean): Promise<MediaAccess> {
  if (Platform.OS !== "android") return { mic: true, cam: true };
  const P = PermissionsAndroid.PERMISSIONS;
  const res = await PermissionsAndroid.requestMultiple(video ? [P.RECORD_AUDIO, P.CAMERA] : [P.RECORD_AUDIO]);
  return { mic: res[P.RECORD_AUDIO] === "granted", cam: video ? res[P.CAMERA] === "granted" : true };
}

export const isDenied = (e: unknown): boolean => {
  const text = `${(e as { name?: string })?.name ?? ""} ${(e as { message?: string })?.message ?? ""}`;
  return /NotAllowed|Permission|denied/i.test(text);
};
