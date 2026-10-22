import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { PreviewText, excerpt, layoutDoc, slotCount } from "@/entities/doc-form";
import { BottomSheet, Button, ErrorView, SheetScroll, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { kicker?: string; text: string; loading: boolean; error: unknown; onRetry: () => void; open: boolean; onOpen: () => void; onClose: () => void; title: string };

const EXCERPT = 900;

// The document as a reader sees it: the first part inline, the whole of it full-screen in a sheet. Line breaks, the heading, the recipient block,
// the signatures and the attachments come from the server's text untouched; empty spots stay highlighted as the server sent them.
export function TemplatePreview({ kicker, text, loading, error, onRetry, open, onOpen, onClose, title }: Props) {
  const { t } = useT();
  const long = text.length > EXCERPT;
  const slots = useMemo(() => slotCount(layoutDoc(text)), [text]);
  return (
    <View style={s.col}>
      <Text variant="h4">{t("dcat.previewTitle")}</Text>
      {loading && !text ? (
        <Skeleton height={220} round={16} />
      ) : text ? (
        <>
          <PreviewText text={long ? excerpt(text, EXCERPT) : text} fade={long} slotTotal={slots} kicker={kicker} />
          {long ? <Button title={t("dcat.previewOpen")} icon="maximize-2" variant="soft" full onPress={onOpen} /> : null}
        </>
      ) : error ? (
        <ErrorView error={error} onRetry={onRetry} compact />
      ) : null}
      <BottomSheet visible={open} onClose={onClose} title={title} snaps={[0.94]}>
        <SheetScroll><PreviewText text={text} large kicker={kicker} /></SheetScroll>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 10 } });
