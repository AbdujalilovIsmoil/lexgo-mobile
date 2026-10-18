import { useEffect, useRef, useState } from "react";
import { File } from "expo-file-system";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useTree } from "@/entities/pro-files";
import { exportScan } from "@/features/doc-scanner/model/exportScan";
import { useScan } from "@/features/doc-scanner/model/useScan";
import { EmptyScan } from "@/features/doc-scanner/ui/EmptyScan";
import { ExportSheet } from "@/features/doc-scanner/ui/ExportSheet";
import { FilterBar } from "@/features/doc-scanner/ui/FilterBar";
import { PageCanvas } from "@/features/doc-scanner/ui/PageCanvas";
import { PageStrip } from "@/features/doc-scanner/ui/PageStrip";
import { useUpload } from "@/features/pro-file-upload";
import { useT } from "@/shared/i18n";
import { successHaptic } from "@/shared/lib/haptics";
import { shareFile } from "@/shared/lib/files";
import { defaultScanName, type ScanFormat } from "@/shared/lib/scan/formats";
import type { OcrLang } from "@/shared/lib/scan/ocr";
import { Button, toast } from "@/shared/ui";
import { ActionList, AdminPage } from "@/shared/ui/admin";
import { confirmDialog } from "@/shared/ui/dialog";

// /pro/scan — scan pages with the camera (or pick from the gallery), pick a look, then save them as PDF / Word / JPG / PNG:
// upload into the workspace folder it was opened from, or share / save from the phone.
export default function ProScanPage() {
  const { t } = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ folder?: string | string[] }>();
  const folder = (Array.isArray(params.folder) ? params.folder[0] : params.folder) ?? "";
  const tree = useTree();
  const scan = useScan();
  const up = useUpload({ folderId: folder || undefined }, tree.data?.quota);
  const [sheet, setSheet] = useState(false);
  const [addMenu, setAddMenu] = useState(false);
  const [touched, setTouched] = useState(false); // once the user types a name it is left alone
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(""); // shown inside the sheet: on iOS a toast would sit behind the native modal
  const [name, setName] = useState(() => defaultScanName());
  const where = tree.data?.folders.find((f) => f.id === folder)?.name ?? t("scn.root");
  const has = scan.pages.length > 0;
  const nav = useNavigation();
  const working = useRef(false); // synchronous double-tap guard (state updates land a render late)
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  useEffect(() => nav.setOptions({ gestureEnabled: !has }), [nav, has]); // the iOS edge swipe cannot be vetoed, so it is off while there are pages
  const allow = useRef(false); // set once the scan is on its way, so leaving is no longer a loss
  // Any way out (header arrow, Android back, the iOS swipe) asks first while there are pages to lose.
  useEffect(() => nav.addListener("beforeRemove", (e) => {
    if (!has || allow.current) return;
    e.preventDefault();
    confirmDialog({ title: t("scn.discard"), message: t("scn.discardX"), confirmLabel: t("scn.leave"), cancelLabel: t("scn.keep"), danger: true, icon: "trash-2", onConfirm: () => { allow.current = true; nav.dispatch(e.data.action); } });
  }), [nav, has, t]);
  const run = async (f: ScanFormat, ocr: OcrLang[], then: (file: Awaited<ReturnType<typeof exportScan>>) => Promise<boolean | void>) => {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      const file = await exportScan(scan.pages, scan.filter, f, name, ocr);
      const done = await then(file);
      if (!mounted.current) return; // the user already left: do not pop another screen
      if (file.textFailed) toast(t("scn.ocrFail"), "err");
      if (done === false) setError(t("scn.uploadFail"));
      else {
        successHaptic();
        setSheet(false);
      }
      if (done === true) {
        allow.current = true;
        router.back();
      }
    } catch {
      if (mounted.current) setError(t("scn.failed"));
    } finally {
      working.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const upload = (f: ScanFormat, ocr: OcrLang[]) => run(f, ocr, async (file) => {
    try {
      return (await up.upload([file])) > 0;
    } finally {
      try { new File(file.uri).delete(); } catch { /* the cache is cleaned by the system anyway */ }
    }
  });
  const share = (f: ScanFormat, ocr: OcrLang[]) => run(f, ocr, (file) => shareFile(file.uri, file.mime));
  return (
    <AdminPage title={t("scn.title")} subtitle={has ? t("scn.pages", { n: scan.pages.length }) : t("scn.sub")} right={<View />}
      footer={has ? <Button title={t("scn.next")} icon="arrow-right" iconRight variant="gradient" full onPress={() => { if (!touched) setName(defaultScanName()); setSheet(true); }} /> : undefined}>
      {has ? (
        <View style={s.body}>
          <View style={s.canvas}><PageCanvas page={scan.pages[scan.current]} index={scan.current} total={scan.pages.length} onRotate={() => scan.rotate(scan.current)} onRemove={() => scan.remove(scan.current)} onShift={(by) => scan.shift(scan.current, by)} /></View>
          <FilterBar value={scan.filter} onChange={scan.setFilter} />
          <PageStrip pages={scan.pages} current={scan.current} onPick={scan.setCurrent} onAdd={() => setAddMenu(true)} />
        </View>
      ) : (
        <EmptyScan onCamera={() => void scan.add("camera")} onGallery={() => void scan.add("gallery")} denied={scan.denied} />
      )}
      <ExportSheet visible={sheet} onClose={() => setSheet(false)} pages={scan.pages.length} name={name} onName={(v) => { setTouched(true); setName(v); }} busy={busy} error={error} folder={t("scn.into", { name: where })} onUpload={(f, o) => void upload(f, o)} onShare={(f, o) => void share(f, o)} />
      <ActionList visible={addMenu} onClose={() => setAddMenu(false)} title={t("scn.add")} actions={[{ key: "cam", label: t("scn.cam"), icon: "camera", onPress: () => void scan.add("camera") }, { key: "gal", label: t("scn.gal"), icon: "image", onPress: () => void scan.add("gallery") }]} />
    </AdminPage>
  );
}

const s = StyleSheet.create({ body: { flex: 1, gap: 12, paddingBottom: 6 }, canvas: { flex: 1, paddingHorizontal: 16 } });
