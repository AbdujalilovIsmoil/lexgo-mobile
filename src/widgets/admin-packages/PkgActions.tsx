import { View } from "react-native";
import { useAccess } from "@/entities/access";
import { usePackageAction, type Pkg, type PkgAction } from "@/entities/admin-packages";
import { useSession } from "@/entities/session";
import { Button, confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { pkg: Pkg; onEdit: () => void; onDone: () => void };

// Package lifecycle buttons, driven by the backend status: draft → submit → (another person) approve → publish → stop.
// The creator cannot approve their own package (server rule), so the button is not offered to them.
export function PkgActions({ pkg, onEdit, onDone }: Props) {
  const { t } = useT();
  const a = useAccess();
  const me = useSession()?.user.id;
  const act = usePackageAction();
  const run = (action: PkgAction) => act.mutate({ id: pkg.id, action }, { onSuccess: onDone });
  const ask = (action: PkgAction, danger = false) => confirmDialog({ title: t(`ag5.act.${action}`), message: t(`ag5.ask.${action}`, { name: pkg.title }), confirmLabel: t(`ag5.act.${action}`), cancelLabel: t("adm.cancel"), icon: danger ? "pause-circle" : "check-circle", danger, onConfirm: () => run(action) });
  const create = a.can("packages.create");
  const approve = a.can("packages.approve");
  const s = pkg.status;
  return (
    <View style={{ gap: 10 }}>
      {create && (s === "draft" || s === "stopped") ? <Button title={t("ag5.act.edit")} icon="edit-2" variant="soft" onPress={onEdit} /> : null}
      {create && s === "draft" ? <Button title={t("ag5.act.submit")} icon="send" loading={act.isPending} onPress={() => ask("submit")} /> : null}
      {approve && s === "under_review" && pkg.createdBy !== me ? <Button title={t("ag5.act.approve")} icon="check" loading={act.isPending} onPress={() => ask("approve")} /> : null}
      {s === "under_review" && pkg.createdBy === me ? <Button title={t("ag5.act.self")} variant="soft" disabled /> : null}
      {approve && (s === "approved" || s === "stopped") ? <Button title={t("ag5.act.publish")} icon="upload-cloud" loading={act.isPending} onPress={() => ask("publish")} /> : null}
      {approve && s === "on_sale" ? <Button title={t("ag5.act.stop")} icon="pause-circle" variant="line" loading={act.isPending} onPress={() => ask("stop", true)} /> : null}
      {create ? <Button title={t("ag5.act.clone")} icon="copy" variant="line" loading={act.isPending} onPress={() => run("clone")} /> : null}
    </View>
  );
}
