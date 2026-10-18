import { useState } from "react";
import { useRouter } from "expo-router";
import { getServiceHold } from "@/entities/doc-form";
import { useIsAuthed } from "@/entities/session";
import { confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The ways forward from a catalogue card: sample view, fill it in, hand it to the duty advocate.
// Signed-out visitors are sent to sign in. While an advocate holds the document the constructor asks
// first (the server decides, TZ 14); the hold is read on tap, not per card - a list holds hundreds.
export function useServiceOpen(navigate: (fn: () => void) => void = (fn) => fn()) {
  const { t } = useT();
  const router = useRouter();
  const authed = useIsAuthed();
  const [busy, setBusy] = useState("");
  const push = (path: string) => navigate(() => router.push(path as never));
  const guard = (fn: () => void) => (authed ? fn() : navigate(() => router.push("/auth/login")));

  const fill = (id: string) =>
    guard(() => {
      setBusy(id);
      void getServiceHold(id)
        .catch(() => null)
        .then((hold) => {
          setBusy("");
          const go = () => push(`/services/${id}/fill`);
          if (!hold?.prompt) return go();
          confirmDialog({ title: hold.promptTitle || t("dc1.hold.title"), message: hold.promptText || t("dc1.hold.text"), confirmLabel: t("dc1.hold.continue"), cancelLabel: t("common.cancel"), onConfirm: go });
        });
    });

  return {
    busy,
    fill,
    lawyer: (id: string) => guard(() => push(`/services/${id}/lawyer`)),
    view: (id: string) => guard(() => push(`/services/${id}/view`)),
    guard,
  };
}
