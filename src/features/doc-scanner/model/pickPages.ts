import * as ImagePicker from "expo-image-picker";
import DocumentScanner, { ScanDocumentResponseStatus } from "react-native-document-scanner-plugin";
import { resyncStatusBarSoon } from "@/shared/lib/statusBarSync";
import type { ScanPage } from "./types";

let seq = 0;
const newPage = (uri: string, exif = 1): ScanPage => ({ id: `p${Date.now()}-${seq++}`, uri, turns: 0, exif, preview: "" });
const toPage = (a: ImagePicker.ImagePickerAsset): ScanPage => newPage(a.uri, Number(a.exif?.Orientation ?? 1) || 1);

// The scanner hands back local file paths; iOS gives plain paths, Android sometimes already a file:// uri.
const asUri = (path: string) => (/^[a-z]+:\/\//i.test(path) ? path : `file://${path}`);

// Camera → the system document scanner (VisionKit on iOS, ML Kit on Android): live edge detection, perspective fix, several pages in a row.
// Gallery → plain photos (several at once). null when cancelled, "denied" without camera permission.
export async function pickPages(src: "camera" | "gallery"): Promise<ScanPage[] | "denied" | null> {
  if (src === "camera") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return "denied";
    const res = await DocumentScanner.scanDocument({ croppedImageQuality: 90 }).finally(() => resyncStatusBarSoon()); // the scanner's own dark UI changed the bar
    if (res.status !== ScanDocumentResponseStatus.Success || !res.scannedImages?.length) return null;
    return res.scannedImages.map((p) => newPage(asUri(p))); // already cropped and upright: no EXIF turn to apply
  }
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.9, exif: true, allowsMultipleSelection: true }).finally(() => resyncStatusBarSoon());
  return res.canceled ? null : res.assets.map(toPage);
}
