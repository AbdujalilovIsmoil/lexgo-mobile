import { StyleSheet, View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { nextCount, type PageInfo } from "@/features/my-documents";

// Under the last loaded card: the "10 / 37" counter and, while there is more, a short "Yana 10 ta" button (scrolling to
// the end loads the next ten by itself; the button is the tap alternative and the loader while it fetches).
export function DocListFooter({ page, loading, onMore }: { page: PageInfo; loading: boolean; onMore: () => void }) {
  const { t } = useT();
  if (page.total <= 0) return null;
  return (
    <View style={s.col}>
      <Text variant="caption" tone="gray" accessibilityLiveRegion="polite">{t("docSheet.counter", { a: page.loaded, b: page.total })}</Text>
      {page.more ? <Button title={t("docSheet.more", { n: nextCount(page.loaded, page.total) })} icon="chevron-down" variant="soft" loading={loading} onPress={onMore} style={s.btn} /> : null}
    </View>
  );
}

const s = StyleSheet.create({ col: { alignItems: "center", gap: 10, paddingTop: 16 }, btn: { minHeight: 44, minWidth: 160 } });
