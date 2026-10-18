import { View } from "react-native";
import { BottomSheet, Button, Card, SheetScroll, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { openUrl } from "@/shared/lib/links";
import { safeUrl } from "../lib/safeUrl";
import type { Source } from "../model/types";

type Props = { visible: boolean; onClose: () => void; sources: Source[] };

// Every law reference of an answer with its quoted snippet; the link opens lex.uz & co.
export function SourcesSheet({ visible, onClose, sources }: Props) {
  const { t } = useT();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("ai.sources")} subtitle={t("ax1.sourcesSub", { n: sources.length })} snaps={[0.6, 0.92]}>
      <SheetScroll>
        {sources.map((x, i) => {
          const url = safeUrl(x.url);
          return (
            <Card key={i}>
              <View style={{ gap: 6 }}>
                <Text variant="small" weight="semibold">{x.title || x.url}</Text>
                {x.snippet ? <Text variant="caption" tone="gray" numberOfLines={5}>{x.snippet}</Text> : null}
                {url ? <Button title={t("ax1.openSource")} icon="external-link" variant="soft" size="sm" onPress={() => openUrl(url)} /> : null}
              </View>
            </Card>
          );
        })}
      </SheetScroll>
    </BottomSheet>
  );
}
