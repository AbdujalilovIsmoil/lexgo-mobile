import { useState } from "react";
import type { CheckFile } from "@/entities/market-flow";
import { pickChecked, uploadMessage, type PickedFile } from "@/entities/secure-chat";
import { fileIdFromPath } from "@/entities/pro-order";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

export type Uploading = { key: string; name: string; busy: boolean; file: CheckFile | null };
let seq = 0;

// Proof files of a checklist item go through the order's secure chat upload (the checklist's `file_upload`), so they also land in the chat
// and come back with the id the PATCH needs. `kept` are the files the item already has.
export function useCheckFiles(roomId: string, kept: CheckFile[]) {
  const { t } = useT();
  const [items, setItems] = useState<Uploading[]>(() => kept.map((f) => ({ key: `k${++seq}`, name: f.name || f.id, busy: false, file: f })));
  const upload = async (f: PickedFile) => {
    const key = `f${++seq}`;
    setItems((cur) => [...cur, { key, name: f.name, busy: true, file: null }]);
    try {
      const m = await uploadMessage(roomId, f, { type: "file" });
      const url = m.file?.path ?? "";
      setItems((cur) => cur.map((x) => (x.key === key ? { ...x, busy: false, file: { id: fileIdFromPath(url) || m.id, name: m.file?.name || f.name, url } } : x)));
    } catch {
      setItems((cur) => cur.filter((x) => x.key !== key));
      toast(t("ntd.sellerV2.done.uploadFail", { name: f.name }), "err");
    }
  };
  const pick = async (photo: boolean) => {
    // Only what the server takes is uploaded (its types and per-type sizes, as in the chat); the rest is named in a toast.
    (await pickChecked(photo ? "photo" : "file", t)).slice(0, 6).forEach((f) => void upload(f));
  };
  return {
    items,
    pick,
    remove: (key: string) => setItems((c) => c.filter((x) => x.key !== key)),
    busy: items.some((x) => x.busy),
    files: items.flatMap((x) => (x.file ? [x.file] : [])),
  };
}
