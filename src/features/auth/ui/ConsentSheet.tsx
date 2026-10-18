import { useState } from "react";
import { BottomSheet, ErrorView, ListRow, SheetBack, SheetScroll, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useConsentDetail, type ConsentDoc } from "@/entities/auth-consent";

type Props = { visible: boolean; onClose: () => void; docs: ConsentDoc[] };

// The documents the sign-up tick covers; tap one to read its text.
export function ConsentSheet({ visible, onClose, docs }: Props) {
  const { t } = useT();
  const [id, setId] = useState<string | null>(null);
  const q = useConsentDetail(id);
  const close = () => {
    setId(null);
    onClose();
  };
  return (
    <BottomSheet visible={visible} onClose={close} title={t("au1.docsTitle")} subtitle={t("au1.docsSub")} snaps={[0.6, 0.92]}>
      <SheetScroll>
        {id ? (
          <>
            <SheetBack onPress={() => setId(null)} />
            {q.isLoading ? <Skeleton height={220} round={14} /> : q.isError || !q.data ? <ErrorView error={q.error} onRetry={() => void q.refetch()} compact /> : (
              <>
                <Text variant="h4">{q.data.title}</Text>
                <Text variant="small" tone="gray">{q.data.body}</Text>
              </>
            )}
          </>
        ) : docs.length ? (
          docs.map((d) => <ListRow key={d.id} icon="file-text" title={d.title} sub={`v${d.version}`} onPress={() => setId(d.id)} />)
        ) : (
          <Text variant="small" tone="gray" center>{t("au1.docsEmpty")}</Text>
        )}
      </SheetScroll>
    </BottomSheet>
  );
}
