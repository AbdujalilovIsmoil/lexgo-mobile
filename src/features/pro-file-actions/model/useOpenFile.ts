import { useState } from "react";
import { signedPath, type WFile } from "@/entities/pro-files";
import { useT } from "@/shared/i18n";
import { demoFileUri } from "@/shared/demo/demoFile";
import { downloadAndShare, shareFile } from "@/shared/lib/files";
import { toast } from "@/shared/ui";

export type Opened = { path?: string; uri?: string; name: string; mime: string } | null;
const isDemo = (f: WFile) => f.id.startsWith("demo-");

// Open (in-app preview) or share a workspace file through a fresh short-lived signed link.
export function useOpenFile() {
  const { t } = useT();
  const [opened, setOpened] = useState<Opened>(null);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(file: WFile, then: (path: string) => void | Promise<void>) {
    if (busy) return;
    setBusy(true);
    try {
      await then(await signedPath(file.id));
    } catch {
      toast(t("aw8.openFail"), "err");
    } finally {
      setBusy(false);
    }
  }
  // Demo files (Demo switch) have no bytes on the server: they open as a generated PDF carrying their name.
  const demo = async (file: WFile, share: boolean) => {
    const uri = await demoFileUri(file.id, file.name);
    if (share) return void (await shareFile(uri, "application/pdf"));
    setOpened({ uri, name: `${file.name.replace(/\.[^.]+$/, "")} (${t("aw8.demoFile")}).pdf`, mime: "application/pdf" });
    setVisible(true);
  };
  const open = (file: WFile) => isDemo(file) ? demo(file, false) :
    run(file, (path) => {
      setOpened({ path, name: file.name, mime: file.mime });
      setVisible(true);
    });
  const share = (file: WFile) => isDemo(file) ? demo(file, true) : run(file, (path) => downloadAndShare(path, file.name, file.mime || undefined));
  // A file reachable through a plain API path / URL (e.g. a client's fulfilled request).
  const show = (path: string, name: string, mime: string) => {
    setOpened({ path, name, mime });
    setVisible(true);
  };
  return { open, share, show, busy, visible, opened, close: () => setVisible(false) };
}
