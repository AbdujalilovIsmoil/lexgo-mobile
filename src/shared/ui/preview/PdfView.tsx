import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View, useWindowDimensions } from "react-native";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { OtherView } from "./OtherView";
import { PdfPage } from "./PdfPage";
import { pdfPages } from "./pdfPages";

// Native PDF viewing (TZ 29): pages are rendered one by one, lazily, by the local
// PdfPages module and shown with pinch-zoom.
export function PdfView({ uri, name = "document.pdf", mime }: { uri: string; name?: string; mime?: string }) {
  const c = useColors();
  const { t } = useT();
  const { width } = useWindowDimensions();
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);
  useEffect(() => {
    let live = true;
    pdfPages.pageCount(uri).then((n) => { if (!live) return; if (n > 0) setCount(n); else setFailed(true); }).catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [uri]);
  // Never a blank screen: if the PDF cannot be drawn (damaged, password-protected, no native renderer) offer it to another app.
  if (failed) return <OtherView uri={uri} name={name} mime={mime ?? "application/pdf"} message={t("fnd1.preview.renderFailed")} />;
  if (count == null) return <ActivityIndicator style={{ marginTop: 40 }} color={c.accent} />;
  return (
    <FlatList
      data={Array.from({ length: count }, (_, i) => i)}
      keyExtractor={(i) => String(i)}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      initialNumToRender={2}
      windowSize={5}
      renderItem={({ item }) => <PdfPage uri={uri} index={item} width={width} onFail={item === 0 ? fail : undefined} />}
      contentContainerStyle={{ paddingVertical: 12 }}
    />
  );
}
