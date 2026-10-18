import * as ImagePicker from "expo-image-picker";
import type { ScanPage } from "./types";

let seq = 0;
const toPage = (a: ImagePicker.ImagePickerAsset): ScanPage => ({ id: `p${Date.now()}-${seq++}`, uri: a.uri, turns: 0, exif: Number(a.exif?.Orientation ?? 1) || 1, preview: "" });

// Camera (one page at a time) or gallery (several) → new pages; null when cancelled, "denied" without camera permission.
export async function pickPages(src: "camera" | "gallery"): Promise<ScanPage[] | "denied" | null> {
  if (src === "camera") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return "denied";
  }
  const opts = { mediaTypes: ["images"] as ImagePicker.MediaType[], quality: 0.9, exif: true };
  const res = src === "camera" ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync({ ...opts, allowsMultipleSelection: true });
  return res.canceled ? null : res.assets.map(toPage);
}
