import { requireOptionalNativeModule } from "expo";
import { inReadingOrder, type OcrLang, type OcrPage } from "@/shared/lib/scan/ocr";

type Raw = { width: number; height: number; lines: { text: string; x: number; y: number; w: number; h: number }[] };
// Native `TextOcr` module (modules/text-ocr): Apple Vision on iOS, Tesseract on Android. Missing in Expo Go and in builds made before it was added.
const native = requireOptionalNativeModule<{ recognize(uri: string, langs: OcrLang[]): Promise<Raw> }>("TextOcr");

export const ocrAvailable = native !== null;

const clamp = (n: number) => Math.min(1, Math.max(0, n));

// Text of one rendered page image (the same pixels the PDF / Word file will show, so positions line up).
export async function recognizePage(uri: string, langs: OcrLang[]): Promise<OcrPage> {
  if (!native) throw new Error("ocr-unavailable");
  const r = await native.recognize(uri, langs);
  const lines = r.lines
    .filter((l) => l.text.trim() && l.w > 0 && l.h > 0)
    .map((l) => ({ text: l.text, box: { x: clamp(l.x), y: clamp(l.y), w: clamp(l.w), h: clamp(l.h) } }));
  return { lines: inReadingOrder(lines) };
}
