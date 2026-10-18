import { ActionList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useChangePhoto } from "./useChangePhoto";

// Profile photo actions: from the gallery, from the camera, remove.
export function PhotoSheet({ visible, onClose, hasPhoto, photo }: { visible: boolean; onClose: () => void; hasPhoto: boolean; photo: ReturnType<typeof useChangePhoto> }) {
  const { t } = useT();
  return (
    <ActionList
      visible={visible}
      onClose={onClose}
      title={t("sl5.photo.title")}
      actions={[
        { key: "gallery", label: t("sl5.photo.gallery"), icon: "image", onPress: () => photo.pick(false) },
        { key: "camera", label: t("sl5.photo.camera"), icon: "camera", onPress: () => photo.pick(true) },
        ...(hasPhoto ? [{ key: "remove", label: t("sl5.photo.remove"), icon: "trash-2" as const, danger: true, onPress: photo.remove }] : []),
      ]}
    />
  );
}
