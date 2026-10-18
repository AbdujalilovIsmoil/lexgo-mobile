import { useKept } from "@/shared/lib/useKept";
import type { DetailRenderer, Mode } from "@/entities/service";
import { ConsultSheet } from "./ConsultSheet";
import { PrepSheet } from "./PrepSheet";
import { ReviewSheet } from "./ReviewSheet";

// Each mode owns a differently designed drawer.
export function ModeSheet({ mode: current, onClose, renderDetail }: { mode: Mode | null; onClose: () => void; renderDetail: DetailRenderer }) {
  const mode = useKept(current);
  const open = (key: Mode["key"]) => !!current && mode?.key === key;
  return (
    <>
      <ConsultSheet visible={open("consult")} onClose={onClose} renderDetail={renderDetail} />
      <PrepSheet visible={open("prep")} onClose={onClose} renderDetail={renderDetail} />
      <ReviewSheet visible={open("review")} onClose={onClose} renderDetail={renderDetail} />
    </>
  );
}
