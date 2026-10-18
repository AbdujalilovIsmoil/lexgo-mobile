import { ImageFormat, Skia } from "@shopify/react-native-skia";
import { matrixFor, type ScanFilter } from "@/shared/lib/scan/filters";
import { turnsFromExif, type ScanPage } from "./types";

export type Rendered = { bytes: Uint8Array; width: number; height: number };
type Opts = { maxSide: number; quality: number; png?: boolean };

// One scanned page → encoded image: upright (EXIF + the user's quarter turns), scaled to `maxSide`, with the scanner look applied.
export async function renderPage(p: Pick<ScanPage, "uri" | "turns" | "exif">, filter: ScanFilter, o: Opts): Promise<Rendered> {
  const img = Skia.Image.MakeImageFromEncoded(await Skia.Data.fromURI(p.uri));
  if (!img) throw new Error("decode");
  const iw = img.width();
  const ih = img.height();
  const turns = (p.turns + turnsFromExif(p.exif, iw, ih)) % 4;
  const sw = turns % 2 ? ih : iw;
  const sh = turns % 2 ? iw : ih;
  const k = Math.min(1, o.maxSide / Math.max(sw, sh));
  const W = Math.max(1, Math.round(sw * k));
  const H = Math.max(1, Math.round(sh * k));
  const surface = Skia.Surface.MakeOffscreen(W, H);
  if (!surface) {
    img.dispose();
    throw new Error("surface");
  }
  const paint = Skia.Paint();
  try {
    const canvas = surface.getCanvas();
    paint.setColorFilter(Skia.ColorFilter.MakeMatrix(matrixFor(filter)));
    canvas.drawColor(Skia.Color("white"));
    canvas.translate(W / 2, H / 2);
    canvas.rotate(turns * 90, 0, 0);
    canvas.drawImageRect(img, Skia.XYWHRect(0, 0, iw, ih), Skia.XYWHRect((-iw * k) / 2, (-ih * k) / 2, iw * k, ih * k), paint);
    surface.flush();
    const snap = surface.makeImageSnapshot();
    const bytes = snap.encodeToBytes(o.png ? ImageFormat.PNG : ImageFormat.JPEG, o.quality);
    snap.dispose();
    return { bytes, width: W, height: H };
  } finally {
    // Free the decoded bitmap and the surface right away (a 12 MP photo is ~48 MB) instead of waiting for the GC.
    paint.dispose();
    surface.dispose();
    img.dispose();
  }
}
