import { useState } from "react";
import { pickDocuments, pickImages, type PickOut } from "@/shared/lib/upload";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type PickedDoc = { uri: string; name: string; mime: string; size: number };

const EXTS = /\.(pdf|jpe?g|png)$/i; // PDF / JPG / PNG, ≤ 15 MB (TZ 40: checked before anything leaves the phone)

// Choose a proof document from Files or the camera; size / type problems are shown right away.
export function useDocPick() {
  const { t } = useT();
  const [doc, setDoc] = useState<PickedDoc | null>(null);
  const take = (r: PickOut) => {
    if (!r) return;
    if (r.error) return toast(t(r.error === "tooBig" ? "sl3.docs.tooBig" : "sl3.docs.badType"), "err");
    if (r.files[0]) setDoc(r.files[0]);
  };
  return {
    doc,
    clear: () => setDoc(null),
    fromFiles: async () => take(await pickDocuments({ types: ["application/pdf", "image/jpeg", "image/png"], exts: EXTS, maxMb: 15 })),
    fromCamera: async () => take(await pickImages({ camera: true, exts: EXTS, maxMb: 15 })),
  };
}
