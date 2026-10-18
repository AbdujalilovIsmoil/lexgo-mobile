import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, IconButton } from "@/shared/ui";
import { ActionList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { docCan, editorPath, type DocFile, type DocReq } from "@/entities/doc-queue";
import { FulfillSheet, useLiveCall } from "@/features/doc-editor";
import { TransferSheet, useClaim } from "@/features/doc-pool";
import { useDocMenu } from "./useDocMenu";

type Sheet = "" | "menu" | "transfer" | "upload";

// Sticky actions of the detail screen: the one main step (take / open editor / view sent file) + a menu.
export function DocFooter({ doc, onView }: { doc: DocReq; onView: (f: DocFile) => void }) {
  const { t } = useT();
  const router = useRouter();
  const ccl = useAccess().callCenterLawyer;
  const me = useSession()?.user.id ?? "";
  const can = docCan(doc, me, ccl);
  const [sheet, setSheet] = useState<Sheet>("");
  const claim = useClaim((id) => router.replace(editorPath(id)));
  const live = useLiveCall(doc.chatRoomId, sheet === "menu");
  const menu = useDocMenu(doc, can, live.data ?? "", { transfer: () => setSheet("transfer"), upload: () => setSheet("upload") });
  const open = () => router.push(editorPath(doc.id));
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      {can.claim ? <Button title={t("ad2.claim")} icon="check-circle" variant="gradient" loading={claim.isPending} onPress={() => claim.mutate(doc.id)} style={{ flex: 1 }} full /> : null}
      {can.editor ? <Button title={t("ad1.openEditor")} icon="edit-3" variant="gradient" onPress={open} style={{ flex: 1 }} full /> : null}
      {can.sent && doc.finalFile ? <Button title={t("ad1.viewSent")} icon="eye" variant="gradient" onPress={() => doc.finalFile && onView(doc.finalFile)} style={{ flex: 1 }} full /> : null}
      {menu.length ? <IconButton icon="more-horizontal" onPress={() => setSheet("menu")} label={t("ad1.more")} /> : null}
      <ActionList visible={sheet === "menu"} onClose={() => setSheet("")} title={doc.title} actions={menu} />
      <TransferSheet doc={sheet === "transfer" ? doc : null} pool={ccl && doc.assignedId !== me} onClose={() => setSheet("")} onDone={() => router.back()} />
      <FulfillSheet doc={doc} visible={sheet === "upload"} onClose={() => setSheet("")} onSent={() => setSheet("")} />
    </View>
  );
}
