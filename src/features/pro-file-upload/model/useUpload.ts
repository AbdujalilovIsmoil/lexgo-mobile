import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fileKeys, uploadFile, useLimits, type Quota } from "@/entities/pro-files";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { pickDocuments, pickImages, type Picked } from "@/shared/lib/upload";
import { toast } from "@/shared/ui";
import { validate } from "./validate";

export type UploadState = { busy: boolean; index: number; total: number; bytesDone: number; bytesTotal: number };
const IDLE: UploadState = { busy: false, index: 0, total: 0, bytesDone: 0, bytesTotal: 0 };
export type Source = "files" | "photos" | "camera";

// Pick → validate against the server policy and quota → upload one by one (progress per file) → refresh.
export function useUpload(where: { folderId?: string; caseId?: string }, quota?: Quota) {
  const { t } = useT();
  const qc = useQueryClient();
  const limits = useLimits().data;
  const [state, setState] = useState<UploadState>(IDLE);
  const stop = useRef(false);

  async function run(files: Picked[]): Promise<number> {
    const v = validate(files, limits);
    v.bad.forEach((b) => toast(t(`aw8.${b.reason}`, { name: b.name, mb: b.mb }), "err"));
    const total = v.ok.reduce((n, f) => n + f.size, 0);
    if (quota && quota.quotaBytes > 0 && total > quota.remainingBytes) return toast(t("aw8.noSpace"), "err"), 0;
    stop.current = false;
    let done = 0;
    let failed = 0;
    for (const [i, f] of v.ok.entries()) {
      if (stop.current) break;
      setState({ busy: true, index: i + 1, total: v.ok.length, bytesDone: done, bytesTotal: total });
      try {
        await uploadFile(f, where);
        done += f.size;
      } catch (e) {
        failed += 1;
        toast(e instanceof ApiError && e.detail ? e.detail : t("aw8.uploadFail", { n: 1 }), "err");
      }
    }
    setState(IDLE);
    void qc.invalidateQueries({ queryKey: fileKeys.all });
    if (v.ok.length > failed) {
      successHaptic();
      toast(t("aw8.uploaded", { n: v.ok.length - failed }), "ok");
    } else if (failed) errorHaptic();
    return v.ok.length - failed;
  }

  const start = async (src: Source) => {
    const picked = src === "files" ? await pickDocuments({ multiple: true }) : await pickImages({ camera: src === "camera", multiple: true });
    if (picked?.files.length) await run(picked.files);
  };
  const cancel = () => {
    stop.current = true;
  };
  return { state, start, cancel, upload: run };
}
