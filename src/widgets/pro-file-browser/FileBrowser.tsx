import { useMemo, useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useGrid } from "@/shared/lib/useGrid";
import { useRouter } from "expo-router";
import { FileRow, FolderRow, cardKind, kindIcon, typeCounts, useTree, viewOf, type Section } from "@/entities/pro-files";
import { useCabinet } from "@/entities/pro-workspace";
import { ItemActions, useOpenFile, type Target } from "@/features/pro-file-actions";
import { UploadMenu, useUpload } from "@/features/pro-file-upload";
import { isForbidden } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useLocalPaged } from "@/shared/lib/pro/useLocalPaged";
import { FilePreview } from "@/shared/ui/preview";
import { PagedList } from "@/shared/ui/admin";
import { fmtBytes } from "@/shared/lib/pro/bytes";
import { BrowserHeader } from "./BrowserHeader";
import { FileFilterSheet } from "./FileFilterSheet";
import { FileCard } from "./FileCard";
import { FolderCard } from "./FolderCard";
import { useFileFilters } from "./useFileFilters";
import { PendingState } from "./PendingState";
import { RequestRows } from "./RequestRows";
import { toRows, type Row } from "./rows";

const SECTIONS: Section[] = ["all", "recent", "starred", "requests"];
// Workspace storage browser: sections, search, breadcrumbs, folder / file rows with actions, quota, upload.
export function FileBrowser() {
  const { t } = useT();
  const query = useTree();
  const limited = useCabinet().data?.limited;
  const tree = query.data;
  const [section, setSection] = useState<Section>("all");
  const [folderId, setFolderId] = useState("");
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<Target | null>(null);
  const [menu, setMenu] = useState(false);
  const router = useRouter();
  const [grid, setGrid] = useState(true);
  const [sheet, setSheet] = useState(false);
  const flt = useFileFilters();
  const g = useGrid({ gap: 14, min: 200, inset: 32 });
  const { width: winW } = useWindowDimensions();
  const cell = g.cell?.width ?? (winW - 32 - 14) / 2;
  const needle = useDebounced(q, 250);
  const opener = useOpenFile();
  const up = useUpload({ folderId: folderId || undefined }, tree?.quota);
  const rows = useMemo(() => { const v = tree ? viewOf(tree, section, folderId, needle, { type: flt.type, sort: flt.sort }) : { folders: [], files: [] }; return toRows(v.folders, v.files); }, [tree, section, folderId, needle, flt.type, flt.sort]);
  const { shown, query: paged } = useLocalPaged(rows, query, `${section}|${folderId}|${needle}|${flt.type}|${flt.sort}`);
  if (limited || (query.isError && isForbidden(query.error))) return <PendingState />;
  const go = (id: string) => { setSection("all"); setFolderId(id); setQ(""); };
  const header = <BrowserHeader tree={tree} up={{ state: up.state, onCancel: up.cancel }} folderId={folderId} section={section} q={q} grid={grid} sections={SECTIONS} onQ={setQ} onSection={(x) => { setSection(x); setQ(""); }} onGo={go} onGrid={() => setGrid(!grid)} onUpload={() => setMenu(true)} onFilter={() => setSheet(true)} filters={flt} />;
  const card = (r: Row) => {
    const folder = r.k === "folder";
    const ext = folder ? null : r.f.ext;
    const Card = folder ? FolderCard : FileCard;
    return <Card kind={cardKind(ext)} icon={folder ? "folder" : kindIcon(r.f.ext, r.f.mime).icon} tag={ext ? ext.toUpperCase().slice(0, 4) : undefined} name={r.f.name} meta={folder ? t("aw8.items", { n: r.f.fileCount + r.f.folderCount }) : fmtBytes(r.f.size)} starred={r.f.starred} width={cell}
      onPress={() => (folder ? go(r.f.id) : void opener.open(r.f))} onMore={() => setTarget(folder ? { kind: "folder", folder: r.f } : { kind: "file", file: r.f })} />;
  };
  const empty = { icon: "folder" as const, title: section === "starred" ? t("aw8.emptyStarred") : section === "recent" ? t("aw8.emptyRecent") : t("aw8.empty"), text: section === "all" ? t("aw8.emptyText") : undefined };
  return (
    <>
      {section === "requests" ? (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>{header}<RequestRows onPreview={opener.show} /></ScrollView>
      ) : (
        <View style={{ flex: 1 }} onLayout={g.onLayout}>
        <PagedList
          data={shown}
          query={paged}
          keyExtractor={(r) => `${r.k}-${r.f.id}`}
          header={header}
          columns={grid ? g.columns : 1}
          renderItem={(r) => grid ? card(r) : r.k === "folder" ? <FolderRow folder={r.f} onOpen={() => go(r.f.id)} onMore={() => setTarget({ kind: "folder", folder: r.f })} /> : <FileRow file={r.f} onOpen={() => void opener.open(r.f)} onMore={() => setTarget({ kind: "file", file: r.f })} />}
          empty={empty}
          skeletonHeight={70}
        />
        </View>
      )}
      <ItemActions target={target} onClose={() => setTarget(null)} folders={tree?.folders ?? []} opener={opener} onEnter={go} />
      {tree ? <FileFilterSheet f={flt} section={section} sections={SECTIONS} onSection={(x) => { setSection(x); setQ(""); }} counts={typeCounts(tree, section, folderId, needle)} visible={sheet} onClose={() => setSheet(false)} /> : null}
      <UploadMenu visible={menu} onClose={() => setMenu(false)} onPick={(s) => void up.start(s)} onScan={() => router.push({ pathname: "/pro/scan", params: folderId ? { folder: folderId } : {} } as never)} />
      <FilePreview visible={opener.visible} onClose={opener.close} file={opener.opened} />
    </>
  );
}
