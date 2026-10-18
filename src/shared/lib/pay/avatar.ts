import { ImageFormat, Skia } from "@shopify/react-native-skia";

const SIDE = 512;

// The account stores the photo as a data URL (the web does the same): centre-crop to a square,
// scale down to at most 512 px and re-encode as JPEG, so the request stays small.
export async function toAvatarDataUrl(uri: string): Promise<string> {
  const img = Skia.Image.MakeImageFromEncoded(await Skia.Data.fromURI(uri));
  if (!img) throw new Error("decode");
  const side = Math.min(img.width(), img.height());
  const out = Math.min(SIDE, side);
  const surface = Skia.Surface.MakeOffscreen(out, out);
  if (!surface) throw new Error("surface");
  const src = Skia.XYWHRect((img.width() - side) / 2, (img.height() - side) / 2, side, side);
  surface.getCanvas().drawImageRect(img, src, Skia.XYWHRect(0, 0, out, out), Skia.Paint());
  surface.flush();
  return `data:image/jpeg;base64,${surface.makeImageSnapshot().encodeToBase64(ImageFormat.JPEG, 82)}`;
}
