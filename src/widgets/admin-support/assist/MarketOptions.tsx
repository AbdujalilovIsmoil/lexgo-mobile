import { View } from "react-native";
import { OptionSections, QuotePanel } from "@/entities/price-option";
import { Button, Skeleton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { useMarketFlow } from "./useMarketFlow";

// Optional price additions (checkboxes, none is fine) and the backend quote for exactly this selection.
export function MarketOptions({ f }: { f: ReturnType<typeof useMarketFlow> }) {
  const { t } = useT();
  const { opts, quote } = f;
  if (!f.target) return null;
  return (
    <View style={{ gap: 12 }}>
      {opts.isLoading ? <Skeleton height={80} round={14} /> : null}
      {opts.isError ? <Button title={t("ntd.po.retry")} variant="soft" size="sm" onPress={() => void opts.refetch()} /> : null}
      {opts.data ? <OptionSections sections={opts.data.sections} ids={quote.ids} onToggle={quote.toggle} /> : null}
      <QuotePanel quote={quote.quote} pending={quote.pending} error={quote.error} onRetry={quote.retry} />
    </View>
  );
}
