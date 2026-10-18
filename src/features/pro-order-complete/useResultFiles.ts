import { useState } from "react";
import { CHAT_EXTS, MAX_MB, uploadMessage, type PickedFile } from "@/entities/secure-chat";
import { fileIdFromPath, type ResultFile } from "@/entities/pro-order";
import { pickDocuments, pickImages } from "@/shared/lib/upload";
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
    const res = photo ? await pickImages({ maxMb: MAX_MB, multiple: true }) : await pickDocuments({ maxMb: MAX_MB, exts: CHAT_EXTS, multiple: true });
    if (!res) return;
    if (res.error) return toast(t(res.error === "tooBig" ? "ntd.sellerV2.done.tooBig" : "ms3.badType", { mb: MAX_MB }), "err");
    res.files.slice(0, 6).forEach((f) => void upload(f));
  };
  return { items, pick, remove: (key: string) => setItems((c) => c.filter((x) => x.key !== key)), reset: () => setItems([]), busy: items.some((x) => x.busy), files: items.flatMap((x) => (x.file ? [x.file] : [])) };
}
