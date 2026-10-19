import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useColors } from "@/shared/theme";
import { ZoomImage } from "./ZoomImage";
import { pdfPages } from "./pdfPages";

type Page = { uri: string; width: number; height: number };

// One rendered PDF page (2x the screen width for sharp text when zoomed).
export function PdfPage({ uri, index, width, onFail }: { uri: string; index: number; width: number; onFail?: () => void }) {
  const c = useColors();
  const [page, setPage] = useState<Page | null>(null);
  useEffect(() => {
    let live = true;
    pdfPages.renderPage(uri, index, Math.round(width * 2)).then((p) => live && setPage(p)).catch(() => live && onFail?.());
    return () => {
      live = false;
    };
  }, [uri, index, width, onFail]);
  if (!page) return <View style={{ height: width * 1.3, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={c.accent} /></View>;
  return <ZoomImage uri={page.uri} width={width} height={(page.height / page.width) * width} />;
}
