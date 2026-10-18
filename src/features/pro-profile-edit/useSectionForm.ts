import { useEffect } from "react";
import type { FieldValues } from "react-hook-form";
import type { z } from "zod";
import { useDraft } from "@/entities/pro-profile";
import { useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";

// react-hook-form state of one profile sheet. Unsaved input is kept as a draft (survives closing the sheet / the app)
// and is restored the next time the sheet opens; a successful save or "discard" removes it.
export function useSectionForm<S extends z.ZodType<FieldValues, FieldValues>>(userId: string, section: string, schema: S, initial: z.input<S>, visible: boolean) {
  const f = useAppForm(schema, initial);
  const d = useDraft<z.input<S>>(userId, section);
  const { store, clear } = d;
  useSheetReset(visible, () => f.reset({ ...initial, ...d.draft }));
  useEffect(() => {
    const sub = f.watch((v, info) => {
      if (!info.name) return; // a reset is not an edit
      if (JSON.stringify(v) === JSON.stringify(initial)) clear();
      else store(v as z.input<S>);
    });
    return () => sub.unsubscribe();
  }, [f, initial, store, clear]);
  return {
    f,
    restored: !!d.draft,
    done: clear,
    discard: () => {
      clear();
      f.reset(initial);
    },
  };
}
