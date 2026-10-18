import { useLimits } from "@/entities/pro-files";
import { useT } from "@/shared/i18n";
import { ActionList } from "@/shared/ui/admin";
import type { Source } from "../model/useUpload";

// Where to take the files from: documents picker, gallery or camera (limits shown from the server policy).
export function UploadMenu({ visible, onClose, onPick, onScan }: { visible: boolean; onClose: () => void; onPick: (s: Source) => void; onScan?: () => void }) {
  const { t } = useT();
  const lim = useLimits().data;
  return (
    <ActionList
      visible={visible}
      onClose={onClose}
      title={lim ? `${t("aw8.upload")} · ${t("aw8.limits", { mb: lim.fileMaxMb, vmb: lim.videoMaxMb })}` : t("aw8.upload")}
      actions={[
        { key: "files", label: t("aw8.up.files"), icon: "file-plus", onPress: () => onPick("files") },
        { key: "photos", label: t("aw8.up.photos"), icon: "image", onPress: () => onPick("photos") },
        ...(onScan ? [{ key: "scan", label: t("scn.title"), icon: "maximize" as const, onPress: onScan }] : []),
        { key: "camera", label: t("aw8.up.camera"), icon: "camera", onPress: () => onPick("camera") },
      ]}
    />
  );
}
