import { useRecentDocs } from "@/entities/client-stats";
import { DocRow, useKindNav } from "@/features/dashboard-kinds";
import { useT } from "@/shared/i18n";
import { PreviewList } from "./PreviewList";

type Props = { go: (fn: () => void) => void };

// Drawer rows of "Hujjatlarim": the five most recently changed documents.
export function DocsPreview({ go }: Props) {
  const { t } = useT();
  const nav = useKindNav();
  const q = useRecentDocs();
  return <PreviewList query={q} items={q.data ?? []} keyOf={(d) => d.id} empty={{ icon: "file-text", title: t("cl7.empty.documents"), text: t("cl7.empty.documentsText") }} render={(d) => <DocRow doc={d} onPress={() => go(() => nav.doc(d.id))} />} />;
}
