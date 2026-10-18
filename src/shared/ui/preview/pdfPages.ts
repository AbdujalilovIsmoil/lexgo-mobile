import { requireNativeModule } from "expo-modules-core";

type Page = { uri: string; width: number; height: number };
type Native = { pageCount(uri: string): Promise<number>; renderPage(uri: string, index: number, width: number): Promise<Page> };

// Local native module (modules/pdf-pages): PDFKit on iOS, PdfRenderer on Android.
export const pdfPages = requireNativeModule<Native>("PdfPages");
