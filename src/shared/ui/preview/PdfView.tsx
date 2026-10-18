import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View, useWindowDimensions } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "../Text";
import { PdfPage } from "./PdfPage";
import { pdfPages } from "./pdfPages";

// Native PDF viewing (TZ 29): pages are rendered one by one, lazily, by the local
// PdfPages module and shown with pinch-zoom.
export function PdfView({ uri }: { uri: string }) {
  const c = useColors();
  const { width } = useWindowDimensions();
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    pdfPages.pageCount(uri).then((n) => live && setCount(n)).catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [uri]);
  if (failed) return <Text tone="gray" center style={{ padding: 24 }}>PDF</Text>;
  if (count == null) return <ActivityIndicator style={{ marginTop: 40 }} color={c.accent} />;
  return (
    <FlatList
      data={Array.from({ length: count }, (_, i) => i)}
      keyExtractor={(i) => String(i)}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      initialNumToRender={2}
      windowSize={5}
      renderItem={({ item }) => <PdfPage uri={uri} index={item} width={width} />}
      contentContainerStyle={{ paddingVertical: 12 }}
    />
  );
}
