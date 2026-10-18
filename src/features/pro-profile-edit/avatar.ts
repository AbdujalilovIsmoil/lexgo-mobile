import { ImageFormat, Skia } from "@shopify/react-native-skia";

const MAX_SIDE = 512;

// The account record stores the photo as a data URL (the web does the same), so the picture is scaled
// down to 512 px and re-encoded as JPEG before it is sent.
export async function toAvatarDataUrl(uri: string): Promise<string> {
  const img = Skia.Image.MakeImageFromEncoded(await Skia.Data.fromURI(uri));
  if (!img) throw new Error("decode");
  const k = Math.min(1, MAX_SIDE / Math.max(img.width(), img.height()));
  const w = Math.max(1, Math.round(img.width() * k));
  const h = Math.max(1, Math.round(img.height() * k));
  const surface = Skia.Surface.MakeOffscreen(w, h);
  if (!surface) throw new Error("surface");
  surface.getCanvas().drawImageRect(img, Skia.XYWHRect(0, 0, img.width(), img.height()), Skia.XYWHRect(0, 0, w, h), Skia.Paint());
  surface.flush();
  return `data:image/jpeg;base64,${surface.makeImageSnapshot().encodeToBase64(ImageFormat.JPEG, 82)}`;
}
