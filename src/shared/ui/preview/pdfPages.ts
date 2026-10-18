import { requireOptionalNativeModule } from "expo-modules-core";

type Page = { uri: string; width: number; height: number };
type Native = { pageCount(uri: string): Promise<number>; renderPage(uri: string, index: number, width: number): Promise<Page> };

// Local native module (modules/pdf-pages): PDFKit on iOS, PdfRenderer on Android.
// Optional: a build without it must still start; the viewers catch the rejection and fall back to a plain "PDF" label.
const missing = () => Promise.reject(new Error("PdfPages native module is not installed"));
export const pdfPages: Native = requireOptionalNativeModule<Native>("PdfPages") ?? { pageCount: missing, renderPage: missing };
