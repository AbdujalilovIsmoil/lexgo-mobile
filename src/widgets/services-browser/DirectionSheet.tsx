import { useState } from "react";
import { View } from "react-native";
import type { DetailRenderer, Service, ServiceCategory } from "@/entities/service";
import { BottomSheet, SheetScroll } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useKept } from "@/shared/lib/useKept";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { useT } from "@/shared/i18n";
import { DirectionHeader } from "./DirectionHeader";
import { DirectionList } from "./DirectionList";

type Props = { category: ServiceCategory | null; onClose: () => void; renderDetail: DetailRenderer };

// One direction in a drawer: search + subdirection chips stay pinned, the
// service cards scroll below; a tapped card turns the drawer into its detail.
export function DirectionSheet({ category: current, onClose, renderDetail }: Props) {
  const { t } = useT();
  const category = useKept(current);
  const [state, setState] = useState({ id: "", q: "", sub: "", picked: null as Service | null });
  const fresh = category && state.id === category.id ? state : { id: category?.id ?? "", q: "", sub: "", picked: null };
  const set = (p: Partial<typeof state>) => setState({ ...fresh, ...p });
  const q = useDebounced(fresh.q, 350);
  const go = useSheetNavigate(onClose);
  return (
    <BottomSheet visible={!!current} onClose={onClose} title={fresh.picked ? undefined : category?.name} subtitle={fresh.picked ? undefined : t("services.servicesCount", { n: category?.servicesCount ?? 0 })}>
      {category ? (
        fresh.picked ? (
          <SheetScroll>{renderDetail(fresh.picked, () => set({ picked: null }), go)}</SheetScroll>
        ) : (
          <View style={{ flex: 1 }}>
            <DirectionHeader category={category} q={fresh.q} onQ={(v) => set({ q: v })} sub={fresh.sub} onSub={(v) => set({ sub: v })} />
            <SheetScroll><DirectionList cat={category.id} sub={fresh.sub} q={q} onPick={(s) => set({ picked: s })} /></SheetScroll>
          </View>
        )
      ) : null}
    </BottomSheet>
  );
}
