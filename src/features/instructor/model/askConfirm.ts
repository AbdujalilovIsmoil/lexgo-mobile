import { confirmDialog, useDialogStore, type DialogSpec } from "@/shared/ui/dialog";

export type Asked<T> = { ok: true; value: T } | { ok: false };

// Native confirm dialog as a promise. `run` executes INSIDE the dialog (it shows a spinner and stays open
// when `run` throws, so the user can retry or cancel); resolves {ok:false} when the dialog was dismissed.
export function askConfirm<T>(spec: Omit<DialogSpec, "onConfirm">, run: () => Promise<T>): Promise<Asked<T>> {
  return new Promise((resolve) => {
    let done: { value: T } | null = null;
    const full: DialogSpec = {
      ...spec,
      onConfirm: async () => {
        done = { value: await run() };
      },
    };
    const off = useDialogStore.subscribe((st) => {
      if (st.spec === full) return;
      off();
      resolve(done ? { ok: true, value: done.value } : { ok: false });
    });
    confirmDialog(full);
  });
}
