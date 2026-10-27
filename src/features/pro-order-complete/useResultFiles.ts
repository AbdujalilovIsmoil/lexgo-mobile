import { useState } from "react";
import { pickChecked, uploadMessage, type PickedFile } from "@/entities/secure-chat";
import { fileIdFromPath, type ResultFile } from "@/entities/pro-order";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

export type Attached = { key: string; name: string; busy: boolean; file: ResultFile | null };
let seq = 0;

// Result files go through the app's secure upload (the order's secure chat room) and come back with the file id and
// secure download URL that the completion request needs (TZ 13).
export function useResultFiles(roomId: string) {
  const { t } = useT();
  const [items, setItems] = useState<Attached[]>([]);
  const patch = (key: string, p: Partial<Attached>) => setItems((cur) => cur.map((x) => (x.key === key ? { ...x, ...p } : x)));
  const upload = async (f: PickedFile) => {
    const key = `f${++seq}`;
    setItems((cur) => [...cur, { key, name: f.name, busy: true, file: null }]);
    try {
      const m = await uploadMessage(roomId, f, { type: "file" });
      const url = m.file?.path ?? "";
      patch(key, { busy: false, file: { fileId: fileIdFromPath(url) || m.id, fileName: m.file?.name || f.name, downloadUrl: url } });
    } catch {
      setItems((cur) => cur.filter((x) => x.key !== key));
      toast(t("ntd.sellerV2.done.uploadFail", { name: f.name }), "err");
    }
  };
  const pick = async (photo: boolean) => {
    // Only what the server takes is uploaded (its types and per-type sizes, as in the chat); the rest is named in a toast.
    (await pickChecked(photo ? "photo" : "file", t)).slice(0, 6).forEach((f) => void upload(f));
  };
  return { items, pick, remove: (key: string) => setItems((c) => c.filter((x) => x.key !== key)), reset: () => setItems([]), busy: items.some((x) => x.busy), files: items.flatMap((x) => (x.file ? [x.file] : [])) };
}
