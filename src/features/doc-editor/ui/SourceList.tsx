import { View } from "react-native";
import { Button, ErrorView, Skeleton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { isCurrentSource, type SourceOption } from "@/entities/doc-queue";
import { useSourceFlow } from "../model/useSources";
import { SourceRow } from "./SourceRow";

type Props = { flow: ReturnType<typeof useSourceFlow>; onPick: (o: SourceOption) => void; onUpload: () => void };

// The editor's possible starting points (+ "upload my own .docx"); the container decides what a tap does.
export function SourceList({ flow, onPick, onUpload }: Props) {
  const { t } = useT();
  const { q, select, upload } = flow;
  if (q.isLoading) return <View style={{ gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={68} round={16} />)}</View>;
  if (q.isError || !q.data) return <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />;
  const data = q.data;
  return (
    <View style={{ gap: 10 }}>
      {data.options.map((o) => (
        <SourceRow key={o.key} opt={o} current={isCurrentSource(o, data)} busy={select.isPending && select.variables?.key === o.key} onPress={() => !isCurrentSource(o, data) && onPick(o)} />
      ))}
      <Button title={t("ad4.uploadOwn")} icon="upload" variant="line" full loading={upload.isPending} onPress={onUpload} />
    </View>
  );
}
